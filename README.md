# Fuel Tracker Application

This repository contains the source code for the Fuel Tracker application, a project from the codejam-2.0 challenge.

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following software installed on your system:

-   [Git](https://git-scm.com/downloads)
-   [Docker](https://www.docker.com/products/docker-desktop)

### Setup and Installation

1.  **Clone the repository**

    Open your terminal or command prompt and run the following command to clone the project from GitHub.

    ```bash
    git clone https://github.com/omdataart/codejam-2.0.git
    ```

2.  **Navigate to the project directory**

    Change your current directory to the newly cloned project folder.

    ```bash
    cd codejam-2.0
    ```

3.  **Checkout the `master` branch**

    Ensure you are on the `master` branch. This is typically the default branch after cloning, but you can confirm by running:

    ```bash
    git checkout master
    ```

4.  **Build and run with Docker Compose**

    Use Docker Compose to build the necessary images and start the application containers.

    ```bash
    docker compose up --build
    ```
    ```bash
     http://localhost:3000
    ```

After the command finishes, the application will be running. You can access it by navigating to `http://localhost:3000` (or the port specified in your Docker configuration) in your web browser.
