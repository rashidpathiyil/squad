package models

import (
	"fmt"
	"strings"
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

	// Standard additional fields
	Company    string `json:"company,omitempty" bson:"company,omitempty"`
	Title      string `json:"title,omitempty" bson:"title,omitempty"`
	Industry   string `json:"industry,omitempty" bson:"industry,omitempty"`
	Location   string `json:"location,omitempty" bson:"location,omitempty"`
	Department string `json:"department,omitempty" bson:"department,omitempty"`

	// Dynamic/custom fields - supports any additional fields from import
	CustomFields map[string]interface{} `json:"customFields,omitempty" bson:"customFields,omitempty"`
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

// Enhanced bulk import request with field mapping
type EnhancedBulkCreateContactRequest struct {
	Contacts     []map[string]interface{} `json:"contacts" validate:"required"`
	FieldMapping map[string]string        `json:"fieldMapping,omitempty"` // Optional manual field mapping
}

// Response for enhanced bulk import with field detection
type EnhancedBulkImportResponse struct {
	ProcessedContacts []Contact    `json:"processedContacts"`
	Errors            []string     `json:"errors"`
	FieldSummary      FieldSummary `json:"fieldSummary"`
	SkippedContacts   int          `json:"skippedContacts"`
}

// Summary of fields detected and processed
type FieldSummary struct {
	DetectedFields    []string          `json:"detectedFields"` // All fields found in the import
	StandardFields    []string          `json:"standardFields"` // Fields mapped to standard schema
	CustomFields      []string          `json:"customFields"`   // Fields stored as custom fields
	FieldMappings     map[string]string `json:"fieldMappings"`  // How fields were mapped
	TotalContacts     int               `json:"totalContacts"`
	ProcessedContacts int               `json:"processedContacts"`
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

// Field mapping utilities for dynamic imports
var StandardFieldMappings = map[string]string{
	"name":          "name",
	"full name":     "name",
	"fullname":      "name",
	"email":         "email",
	"email address": "email",
	"e-mail":        "email",
	"phone":         "phone",
	"phone number":  "phone",
	"mobile":        "phone",
	"company":       "company",
	"organization":  "company",
	"employer":      "company",
	"title":         "title",
	"job title":     "title",
	"position":      "title",
	"role":          "title",
	"industry":      "industry",
	"sector":        "industry",
	"location":      "location",
	"city":          "location",
	"address":       "location",
	"department":    "department",
	"dept":          "department",
	"division":      "department",
}

// Helper function to normalize field names
func NormalizeFieldName(fieldName string) string {
	if fieldName == "" {
		return ""
	}

	// Convert to lowercase and trim spaces
	normalized := strings.ToLower(strings.TrimSpace(fieldName))

	// Remove common punctuation
	normalized = strings.ReplaceAll(normalized, "_", " ")
	normalized = strings.ReplaceAll(normalized, "-", " ")
	normalized = strings.ReplaceAll(normalized, ".", " ")

	// Check if we have a standard mapping
	if standardField, exists := StandardFieldMappings[normalized]; exists {
		return standardField
	}

	return normalized
}

// Helper function to set field value on OriginalContact
func (oc *OriginalContact) SetFieldValue(fieldName string, value interface{}) {
	if value == nil || value == "" {
		return
	}

	strValue := fmt.Sprintf("%v", value)
	strValue = strings.TrimSpace(strValue)

	if strValue == "" {
		return
	}

	switch fieldName {
	case "name":
		oc.Name = strValue
	case "email":
		oc.Email = strValue
	case "phone":
		oc.Phone = strValue
	case "company":
		oc.Company = strValue
	case "title":
		oc.Title = strValue
	case "industry":
		oc.Industry = strValue
	case "location":
		oc.Location = strValue
	case "department":
		oc.Department = strValue
	default:
		// Store in custom fields
		if oc.CustomFields == nil {
			oc.CustomFields = make(map[string]interface{})
		}
		oc.CustomFields[fieldName] = strValue
	}
}
