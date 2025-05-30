package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ContactStatus string

const (
	StatusImported   ContactStatus = "imported"
	StatusEnriched   ContactStatus = "enriched"
	StatusProcessing ContactStatus = "processing"
	StatusFailed     ContactStatus = "failed"
)

type OriginalContact struct {
	Name  string `json:"name" bson:"name" validate:"required"`
	Email string `json:"email" bson:"email" validate:"required,email"`
	Phone string `json:"phone,omitempty" bson:"phone,omitempty"`
}

type EnrichedContact struct {
	Name           string                 `json:"name" bson:"name"`
	Email          string                 `json:"email" bson:"email"`
	Title          string                 `json:"title,omitempty" bson:"title,omitempty"`
	Company        string                 `json:"company,omitempty" bson:"company,omitempty"`
	Location       string                 `json:"location,omitempty" bson:"location,omitempty"`
	Bio            string                 `json:"bio,omitempty" bson:"bio,omitempty"`
	Skills         []string               `json:"skills,omitempty" bson:"skills,omitempty"`
	SocialProfiles map[string]string      `json:"socialProfiles,omitempty" bson:"socialProfiles,omitempty"`
	Industry       string                 `json:"industry,omitempty" bson:"industry,omitempty"`
	Experience     map[string]interface{} `json:"experience,omitempty" bson:"experience,omitempty"`
}

type ConfidenceScores struct {
	Name           int            `json:"name" bson:"name"`
	Email          int            `json:"email" bson:"email"`
	Title          int            `json:"title,omitempty" bson:"title,omitempty"`
	Company        int            `json:"company,omitempty" bson:"company,omitempty"`
	Location       int            `json:"location,omitempty" bson:"location,omitempty"`
	Bio            int            `json:"bio,omitempty" bson:"bio,omitempty"`
	Skills         int            `json:"skills,omitempty" bson:"skills,omitempty"`
	SocialProfiles map[string]int `json:"socialProfiles,omitempty" bson:"socialProfiles,omitempty"`
	Industry       int            `json:"industry,omitempty" bson:"industry,omitempty"`
}

type Sources struct {
	Name           string `json:"name,omitempty" bson:"name,omitempty"`
	Email          string `json:"email,omitempty" bson:"email,omitempty"`
	Title          string `json:"title,omitempty" bson:"title,omitempty"`
	Company        string `json:"company,omitempty" bson:"company,omitempty"`
	Location       string `json:"location,omitempty" bson:"location,omitempty"`
	Bio            string `json:"bio,omitempty" bson:"bio,omitempty"`
	Skills         string `json:"skills,omitempty" bson:"skills,omitempty"`
	SocialProfiles string `json:"socialProfiles,omitempty" bson:"socialProfiles,omitempty"`
	Industry       string `json:"industry,omitempty" bson:"industry,omitempty"`
}

type EnrichmentSummary struct {
	FieldsEnriched    []string `json:"fieldsEnriched" bson:"fieldsEnriched"`
	FieldsNotFound    []string `json:"fieldsNotFound" bson:"fieldsNotFound"`
	OverallConfidence int      `json:"overallConfidence" bson:"overallConfidence"`
}

type Contact struct {
	ID                primitive.ObjectID `json:"_id" bson:"_id,omitempty"`
	UserID            primitive.ObjectID `json:"userId" bson:"userId"`
	Status            ContactStatus      `json:"status" bson:"status"`
	OriginalContact   OriginalContact    `json:"originalContact" bson:"originalContact"`
	EnrichedContact   *EnrichedContact   `json:"enrichedContact,omitempty" bson:"enrichedContact,omitempty"`
	ConfidenceScores  *ConfidenceScores  `json:"confidenceScores,omitempty" bson:"confidenceScores,omitempty"`
	Sources           *Sources           `json:"sources,omitempty" bson:"sources,omitempty"`
	EnrichmentSummary *EnrichmentSummary `json:"enrichmentSummary,omitempty" bson:"enrichmentSummary,omitempty"`
	CreatedAt         time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt         time.Time          `json:"updated_at" bson:"updated_at"`
	EnrichedAt        *time.Time         `json:"enriched_at,omitempty" bson:"enriched_at,omitempty"`
}

// Request/Response models for API

type CreateContactRequest struct {
	OriginalContact OriginalContact `json:"originalContact" validate:"required"`
}

type BulkCreateContactRequest struct {
	Contacts []OriginalContact `json:"contacts" validate:"required,dive"`
}

type EnrichContactRequest struct {
	ContactIDs []string `json:"contactIds" validate:"required"`
}

type ContactListResponse struct {
	Contacts   []Contact `json:"contacts"`
	Total      int64     `json:"total"`
	Page       int       `json:"page"`
	PageSize   int       `json:"pageSize"`
	TotalPages int       `json:"totalPages"`
}

type ContactStatsResponse struct {
	TotalContacts      int64 `json:"totalContacts"`
	EnrichedContacts   int64 `json:"enrichedContacts"`
	ProcessingContacts int64 `json:"processingContacts"`
	FailedContacts     int64 `json:"failedContacts"`
	AverageConfidence  int   `json:"averageConfidence"`
}

// External API models
type ExternalEnrichmentRequest struct {
	ContactInfo OriginalContact `json:"contactInfo"`
}

type ExternalEnrichmentResponse struct {
	EnrichedContact   EnrichedContact   `json:"enrichedContact"`
	ConfidenceScores  ConfidenceScores  `json:"confidenceScores"`
	Sources           Sources           `json:"sources"`
	OriginalContact   OriginalContact   `json:"originalContact"`
	EnrichmentSummary EnrichmentSummary `json:"enrichmentSummary"`
}
