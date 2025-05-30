🏗️ **Architecture Overview**

This is a full-stack contact enrichment CRM application built with a **3-tier architecture**:

### **Frontend** (`frontend/`)
- **Technology**: Nuxt 3 + Vue 3 + TypeScript
- **UI Framework**: Tailwind CSS + shadcn/vue components
- **Authentication**: Nuxt Auth Utils with JWT
- **Key Features**: Contact management, bulk import, authentication, modern responsive UI

### **Backend** (`backend/`)
- **Technology**: Go 1.21 + Gin framework
- **Database**: MongoDB Atlas
- **Authentication**: JWT-based with bcrypt password hashing
- **API**: RESTful API with comprehensive CRUD operations

### **Contact Enrichment Service** (`cea/`)
- **Technology**: Nitro (Universal TypeScript framework)
- **AI Integration**: LangChain with multiple providers (OpenAI, Anthropic, Groq, Gemini, Ollama)
- **Search Engine**: SearXNG (privacy-focused metasearch)
- **Purpose**: Standalone microservice for enriching contact data

## 🚀 **Core Functionality**

### **1. Contact Management**
- **CRUD Operations**: Full contact lifecycle management
- **Bulk Import**: Excel/CSV file processing with optimized duplicate checking
- **Search & Filtering**: Advanced search with status-based filtering
- **Export**: Export selected contacts in various formats

### **2. Contact Enrichment**
- **Multi-Source Search**: Uses SearXNG to search Google, Bing, DuckDuckGo
- **AI-Powered**: Multiple LLM providers for intelligent data extraction
- **Confidence Scoring**: Each enriched field has reliability metrics
- **Source Attribution**: Tracks where enriched data originated

### **3. User Authentication**
- **Registration/Login**: Secure JWT-based authentication
- **Session Management**: Token-based with configurable expiration
- **User Isolation**: Each user's contacts are completely separate

## 🛠️ **Key Technologies**

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Nuxt 3, Vue 3, TypeScript, Tailwind CSS, shadcn/vue |
| **Backend** | Go, Gin, MongoDB, JWT, bcrypt |
| **Enrichment** | Nitro, LangChain, SearXNG, Multiple AI APIs |
| **Infrastructure** | Docker, Docker Compose, pnpm |

## 📊 **Data Flow**

1. **Contact Import**: Users upload CSV/Excel → Backend validates & stores → MongoDB
2. **Enrichment Request**: Frontend → Backend → CEA Service
3. **Search Process**: CEA → SearXNG → Multiple search engines → Content extraction
4. **AI Processing**: Search results → LangChain → AI model → Structured enrichment
5. **Result Storage**: Enriched data + confidence scores → MongoDB → Frontend display

## 🎯 **Key Features**

### **Contact Enrichment Process**
1. **Search Strategy**: Multiple queries based on available data (name+company, email, LinkedIn, GitHub)
2. **Content Extraction**: Specialized parsing for LinkedIn, GitHub, company sites
3. **AI Analysis**: Structured prompts with confidence scoring rules
4. **Quality Control**: Emphasis on accuracy over completeness

### **User Interface**
- **Modern Design**: Clean, responsive interface with dark/light mode
- **Real-time Updates**: Progress indicators for enrichment operations
- **Bulk Operations**: Select multiple contacts for batch processing
- **Advanced Filtering**: Search, status filtering, pagination

### **Security & Performance**
- **Authentication**: JWT tokens with secure password hashing
- **API Security**: Key-based authentication for enrichment service
- **Performance**: Optimized database queries and batch processing
- **Monitoring**: Comprehensive error handling and logging

This is a production-ready CRM system designed for businesses that need to enrich contact information at scale while maintaining data accuracy and user experience.
