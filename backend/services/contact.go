package services

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/http"
	"time"

	"contact-enrichment-api/config"
	"contact-enrichment-api/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ContactService struct {
	contactCollection *mongo.Collection
	config            *config.Config
}

func NewContactService(db *mongo.Database, cfg *config.Config) *ContactService {
	return &ContactService{
		contactCollection: db.Collection("contacts"),
		config:            cfg,
	}
}

func (s *ContactService) CreateContact(userID string, req models.CreateContactRequest) (*models.Contact, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	// Check if contact already exists for this user
	filter := bson.M{
		"userId":                userObjectID,
		"originalContact.email": req.OriginalContact.Email,
	}
	var existingContact models.Contact
	err = s.contactCollection.FindOne(ctx, filter).Decode(&existingContact)
	if err == nil {
		return nil, errors.New("contact with this email already exists")
	}

	contact := models.Contact{
		ID:              primitive.NewObjectID(),
		UserID:          userObjectID,
		Status:          models.StatusImported,
		OriginalContact: req.OriginalContact,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	_, err = s.contactCollection.InsertOne(ctx, contact)
	if err != nil {
		return nil, err
	}

	return &contact, nil
}

func (s *ContactService) BulkCreateContacts(userID string, req models.BulkCreateContactRequest) ([]models.Contact, []string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, nil, errors.New("invalid user ID")
	}

	var contacts []models.Contact
	var errors []string
	var documentsToInsert []interface{}

	for i, originalContact := range req.Contacts {
		// Check for duplicates
		filter := bson.M{
			"userId":                userObjectID,
			"originalContact.email": originalContact.Email,
		}
		var existingContact models.Contact
		err := s.contactCollection.FindOne(ctx, filter).Decode(&existingContact)
		if err == nil {
			errors = append(errors, fmt.Sprintf("Row %d: Contact with email %s already exists", i+1, originalContact.Email))
			continue
		}

		contact := models.Contact{
			ID:              primitive.NewObjectID(),
			UserID:          userObjectID,
			Status:          models.StatusImported,
			OriginalContact: originalContact,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		}

		contacts = append(contacts, contact)
		documentsToInsert = append(documentsToInsert, contact)
	}

	if len(documentsToInsert) > 0 {
		_, err = s.contactCollection.InsertMany(ctx, documentsToInsert)
		if err != nil {
			return nil, errors, err
		}
	}

	return contacts, errors, nil
}

func (s *ContactService) GetContacts(userID string, page, pageSize int, status, search string) (*models.ContactListResponse, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	// Build filter
	filter := bson.M{"userId": userObjectID}

	if status != "" {
		filter["status"] = status
	}

	if search != "" {
		filter["$or"] = []bson.M{
			{"originalContact.name": bson.M{"$regex": search, "$options": "i"}},
			{"originalContact.email": bson.M{"$regex": search, "$options": "i"}},
		}
	}

	// Count total documents
	total, err := s.contactCollection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, err
	}

	// Calculate pagination
	skip := (page - 1) * pageSize
	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	// Find documents with pagination
	opts := options.Find().
		SetSkip(int64(skip)).
		SetLimit(int64(pageSize)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := s.contactCollection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var contacts []models.Contact
	err = cursor.All(ctx, &contacts)
	if err != nil {
		return nil, err
	}

	return &models.ContactListResponse{
		Contacts:   contacts,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func (s *ContactService) GetContactByID(userID, contactID string) (*models.Contact, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	contactObjectID, err := primitive.ObjectIDFromHex(contactID)
	if err != nil {
		return nil, errors.New("invalid contact ID")
	}

	filter := bson.M{
		"_id":    contactObjectID,
		"userId": userObjectID,
	}

	var contact models.Contact
	err = s.contactCollection.FindOne(ctx, filter).Decode(&contact)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("contact not found")
		}
		return nil, err
	}

	return &contact, nil
}

func (s *ContactService) EnrichContact(userID, contactID string) (*models.Contact, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Get the contact
	contact, err := s.GetContactByID(userID, contactID)
	if err != nil {
		return nil, err
	}

	// Update status to processing
	err = s.updateContactStatus(contactID, models.StatusProcessing)
	if err != nil {
		return nil, err
	}

	// Call external enrichment API
	enrichmentData, err := s.callEnrichmentAPI(contact.OriginalContact)
	if err != nil {
		// Update status to failed
		s.updateContactStatus(contactID, models.StatusFailed)
		return nil, fmt.Errorf("enrichment failed: %v", err)
	}

	// Update contact with enriched data
	now := time.Now()
	update := bson.M{
		"$set": bson.M{
			"status":            models.StatusEnriched,
			"enrichedContact":   enrichmentData.EnrichedContact,
			"confidenceScores":  enrichmentData.ConfidenceScores,
			"sources":           enrichmentData.Sources,
			"enrichmentSummary": enrichmentData.EnrichmentSummary,
			"updated_at":        now,
			"enriched_at":       now,
		},
	}

	contactObjectID, _ := primitive.ObjectIDFromHex(contactID)
	_, err = s.contactCollection.UpdateOne(ctx, bson.M{"_id": contactObjectID}, update)
	if err != nil {
		return nil, err
	}

	// Return updated contact
	return s.GetContactByID(userID, contactID)
}

func (s *ContactService) BulkEnrichContacts(userID string, contactIDs []string) error {
	// This would typically be handled by a background job queue
	// For now, we'll process them sequentially
	for _, contactID := range contactIDs {
		go func(id string) {
			_, err := s.EnrichContact(userID, id)
			if err != nil {
				// Log error - in production, you'd want proper error handling/retry logic
				fmt.Printf("Failed to enrich contact %s: %v\n", id, err)
			}
		}(contactID)
	}

	return nil
}

func (s *ContactService) GetContactStats(userID string) (*models.ContactStatsResponse, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	pipeline := []bson.M{
		{"$match": bson.M{"userId": userObjectID}},
		{"$group": bson.M{
			"_id":           "$status",
			"count":         bson.M{"$sum": 1},
			"avgConfidence": bson.M{"$avg": "$enrichmentSummary.overallConfidence"},
		}},
	}

	cursor, err := s.contactCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	stats := &models.ContactStatsResponse{}

	for cursor.Next(ctx) {
		var result struct {
			ID            string  `bson:"_id"`
			Count         int64   `bson:"count"`
			AvgConfidence float64 `bson:"avgConfidence"`
		}

		err := cursor.Decode(&result)
		if err != nil {
			continue
		}

		switch result.ID {
		case string(models.StatusImported):
			stats.TotalContacts += result.Count
		case string(models.StatusEnriched):
			stats.EnrichedContacts = result.Count
			stats.TotalContacts += result.Count
			if result.AvgConfidence > 0 {
				stats.AverageConfidence = int(result.AvgConfidence)
			}
		case string(models.StatusProcessing):
			stats.ProcessingContacts = result.Count
			stats.TotalContacts += result.Count
		case string(models.StatusFailed):
			stats.FailedContacts = result.Count
			stats.TotalContacts += result.Count
		}
	}

	return stats, nil
}

func (s *ContactService) updateContactStatus(contactID string, status models.ContactStatus) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	contactObjectID, err := primitive.ObjectIDFromHex(contactID)
	if err != nil {
		return errors.New("invalid contact ID")
	}

	update := bson.M{
		"$set": bson.M{
			"status":     status,
			"updated_at": time.Now(),
		},
	}

	_, err = s.contactCollection.UpdateOne(ctx, bson.M{"_id": contactObjectID}, update)
	return err
}

func (s *ContactService) callEnrichmentAPI(originalContact models.OriginalContact) (*models.ExternalEnrichmentResponse, error) {
	reqBody := models.ExternalEnrichmentRequest{
		ContactInfo: originalContact,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", s.config.EnrichmentAPIURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	if s.config.EnrichmentAPIKey != "" {
		req.Header.Set("Authorization", "Bearer "+s.config.EnrichmentAPIKey)
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("enrichment API returned status %d", resp.StatusCode)
	}

	var enrichmentResponse models.ExternalEnrichmentResponse
	err = json.NewDecoder(resp.Body).Decode(&enrichmentResponse)
	if err != nil {
		return nil, err
	}

	return &enrichmentResponse, nil
}
