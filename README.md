# mypaws 🐾

**mypaws** is a scalable, SEO-first pet community marketplace designed to connect adopters with pets and ethical breeders.

## 🚀 Project Goal

To build a trusted platform for:
1.  **Pet Adoption**: Connecting rescue dogs and cats with loving homes.
2.  **Ethical Breeders**: Verifying and listing responsible breeders.

The platform prioritizes **SEO**, **trust**, and **user verification** to ensure a safe and discoverable experience for all users.

## 🛠️ Tech Stack

*   **Backend**: ASP.NET Core (.NET 8) Web API
*   **Frontend**: Next.js (App Router, SSR + ISR)
*   **Database**: PostgreSQL
*   **Authentication**: Google OAuth + WhatsApp Verification (Meta API)
*   **Infrastructure**: Docker, AWS

## 📦 Getting Started

### Prerequisites

*   **Docker** and **Docker Compose** installed on your machine.
*   **Git**

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/mypaws.git
    cd mypaws
    ```

2.  **Setup Environment Variables**
    *   Copy the example docker-compose file to create your local configuration.
    ```bash
    cp docker-compose.example.yml docker-compose.yml
    ```
    *   **Important**: Edit `docker-compose.yml` and replace the placeholder values (e.g., `YOUR_GOOGLE_CLIENT_ID_HERE`, `mypaws-dev-secret-key...`) with your actual secrets.

3.  **Run with Docker Compose**
    ```bash
    docker-compose up --build
    ```

4.  **Access the Application**
    *   **Frontend**: [http://localhost:3000](http://localhost:3000)
    *   **API**: [http://localhost:5000/swagger](http://localhost:5000/swagger) (Swagger UI)
    *   **Adminer (DB GUI)**: [http://localhost:8080](http://localhost:8080)

## 🔑 Key Features

*   **Dual Verticals**: Specialized flows for Adoption and Ethical Breeding.
*   **SEO-First Architecture**: Programmatic SEO for breed, city, and intent-based pages.
*   **Trust & Safety**: Mandatory WhatsApp verification and admin approval for breeders.
*   **Monetization**: Freemium model with listing limits and paid upgrades.

## 📄 License

[MIT License](LICENSE)
