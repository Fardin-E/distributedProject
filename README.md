# Collaborative Code Compiler

The Collaborative Code Compiler is a set of servers and a web-based IDE that allows users to collaboratively edit code, run code completion, and translate comments to different languages. It is designed to provide a seamless coding experience with real-time collaboration and helpful AI-powered features.

## Table of Contents
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Running the Servers](#running-the-servers)
  - [Accessing the IDE](#accessing-the-ide)
- [Features](#features)
- [Acknowledgments](#acknowledgments)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following dependencies installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (Node Package Manager)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Fardin-E/distributedProject.git
   ```

2. Install the project dependencies:

   ```bash
   cd collaborative-code-compiler
   npm install
   ```

## Usage

### Running the Servers

1. Open three terminals to run the individual servers:

   - Terminal 1 (Server 1):

     ```bash
     cd collaborative-coding-system
     node server1.js
     ```

   - Terminal 2 (Server 2):

     ```bash
     cd collaborative-coding-system
     node translationServer.js
     ```

   - Terminal 3 (Server 3):

     ```bash
     cd collaborative-coding-system
     node compilationServer.js
     ```

2. The servers will be running on the specified ports (3000, 3001, 3002).

### Accessing the IDE

1. Open your web browser and navigate to `http://localhost:3000` to access the Collaborative Coding IDE.

2. Explore the various features such as code editing, running Python, C, and C++, code completion, and comment translation.

## Features

- **Real-Time Collaboration:** Multiple users can collaboratively edit code in real-time.

- **Code Completion:** Utilize AI-powered suggestions for fixing errors and improving code quality.

- **Comment Translation:** Translate code comments to different languages while preserving line numbers and symbols.

- **Multi-Language Support:** Support for Python, C, and C++.

- **Web-Based IDE:** Access the IDE through a web browser without any installation.

## Acknowledgments

- This README was co-written with assistance from ChatGPT.
