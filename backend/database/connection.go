package database

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Database struct {
	Client *mongo.Client
	DB     *mongo.Database
}

func NewConnection(mongoURI, dbName string) (*Database, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(mongoURI)

	// Configure for MongoDB Atlas
	clientOptions.SetRetryWrites(true)
	clientOptions.SetRetryReads(true)
	clientOptions.SetServerSelectionTimeout(30 * time.Second)
	clientOptions.SetConnectTimeout(30 * time.Second)
	clientOptions.SetSocketTimeout(30 * time.Second)

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}

	// Test the connection with a longer timeout
	pingCtx, pingCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer pingCancel()

	err = client.Ping(pingCtx, nil)
	if err != nil {
		return nil, err
	}

	log.Println("Connected to MongoDB!")

	db := client.Database(dbName)

	database := &Database{
		Client: client,
		DB:     db,
	}

	// Create indexes
	if err := database.createIndexes(); err != nil {
		log.Printf("Warning: Failed to create indexes: %v", err)
	}

	return database, nil
}

func (d *Database) Close() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	return d.Client.Disconnect(ctx)
}

func (d *Database) createIndexes() error {
	ctx := context.Background()

	// Users collection indexes
	usersCollection := d.DB.Collection("users")
	_, err := usersCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    map[string]interface{}{"email": 1},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return err
	}

	// Contacts collection indexes
	contactsCollection := d.DB.Collection("contacts")

	// Index on userID for fast user-specific queries
	_, err = contactsCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]interface{}{"userId": 1},
	})
	if err != nil {
		return err
	}

	// Index on email for duplicate detection
	_, err = contactsCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]interface{}{
			"userId":                1,
			"originalContact.email": 1,
		},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return err
	}

	// Index on status for filtering
	_, err = contactsCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]interface{}{"status": 1},
	})
	if err != nil {
		return err
	}

	// Index on created_at for sorting
	_, err = contactsCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]interface{}{"created_at": -1},
	})
	if err != nil {
		return err
	}

	log.Println("Database indexes created successfully")
	return nil
}
