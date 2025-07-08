#!/bin/bash

# SecretVote Demo Script
# This script demonstrates the full workflow of the SecretVote application

echo "🗳️  SecretVote Demo Script"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 Step $1:${NC} $2"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_step "1" "Checking dependencies"
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    
    print_success "All dependencies are installed"
    echo ""
}

# Install project dependencies
install_dependencies() {
    print_step "2" "Installing project dependencies"
    
    if [ ! -d "node_modules" ]; then
        pnpm install
        if [ $? -eq 0 ]; then
            print_success "Dependencies installed successfully"
        else
            print_error "Failed to install dependencies"
            exit 1
        fi
    else
        print_success "Dependencies already installed"
    fi
    echo ""
}

# Set up environment
setup_environment() {
    print_step "3" "Setting up environment"
    
    if [ ! -f ".env.local" ]; then
        cp .env.example .env.local
        print_warning "Created .env.local from .env.example"
        print_warning "Please edit .env.local with your configuration before continuing"
        echo ""
        read -p "Press Enter after editing .env.local to continue..."
    else
        print_success "Environment file already exists"
    fi
    echo ""
}

# Compile smart contracts
compile_contracts() {
    print_step "4" "Compiling smart contracts"
    
    pnpm compile
    if [ $? -eq 0 ]; then
        print_success "Contracts compiled successfully"
    else
        print_error "Failed to compile contracts"
        exit 1
    fi
    echo ""
}

# Run tests
run_tests() {
    print_step "5" "Running tests"
    
    echo "Running smart contract tests..."
    pnpm test
    if [ $? -eq 0 ]; then
        print_success "All tests passed"
    else
        print_warning "Some tests failed - continuing with demo"
    fi
    echo ""
}

# Deploy contracts (optional)
deploy_contracts() {
    print_step "6" "Contract deployment (optional)"
    
    read -p "Do you want to deploy contracts to testnet? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Deploying to Zama testnet..."
        pnpm deploy:testnet
        if [ $? -eq 0 ]; then
            print_success "Contracts deployed successfully"
        else
            print_error "Failed to deploy contracts"
        fi
    else
        print_warning "Skipping contract deployment"
    fi
    echo ""
}

# Start development server
start_frontend() {
    print_step "7" "Starting development server"
    
    echo "Starting Next.js development server..."
    print_success "Frontend will be available at http://localhost:3000"
    print_warning "Press Ctrl+C to stop the server"
    echo ""
    
    # Start the development server in the background
    pnpm dev &
    SERVER_PID=$!
    
    # Wait a bit for server to start
    sleep 5
    
    # Check if server is running
    if kill -0 $SERVER_PID 2>/dev/null; then
        print_success "Development server started successfully"
        echo ""
        echo "🎉 Demo is ready!"
        echo ""
        echo "Next steps:"
        echo "1. Open http://localhost:3000 in your browser"
        echo "2. Connect your MetaMask wallet"
        echo "3. Make sure you're on Zama testnet"
        echo "4. Get testnet tokens from https://faucet.zama.ai"
        echo "5. Create a proposal and start voting!"
        echo ""
        echo "Press Enter to open the application in your browser..."
        read
        
        # Try to open browser (works on macOS, Linux, and Windows)
        if command -v open &> /dev/null; then
            open http://localhost:3000
        elif command -v xdg-open &> /dev/null; then
            xdg-open http://localhost:3000
        elif command -v start &> /dev/null; then
            start http://localhost:3000
        else
            echo "Please manually open http://localhost:3000 in your browser"
        fi
        
        echo ""
        echo "Press Enter to stop the demo server..."
        read
        
        # Stop the server
        kill $SERVER_PID
        print_success "Demo server stopped"
    else
        print_error "Failed to start development server"
        exit 1
    fi
}

# Demo workflow
demo_workflow() {
    echo ""
    echo "🎬 SecretVote Workflow Demo"
    echo "=========================="
    echo ""
    echo "This demo will show you how to:"
    echo "1. 📝 Create a voting proposal"
    echo "2. 🗳️  Cast encrypted votes"
    echo "3. 🔓 Decrypt results after deadline"
    echo "4. 📊 View voting statistics"
    echo ""
    echo "Features demonstrated:"
    echo "• Fully Homomorphic Encryption (FHE)"
    echo "• Private voting with public results"
    echo "• Smart contract interaction"
    echo "• Modern Web3 UI/UX"
    echo ""
}

# Main execution
main() {
    demo_workflow
    check_dependencies
    install_dependencies
    setup_environment
    compile_contracts
    run_tests
    deploy_contracts
    start_frontend
}

# Trap to clean up background processes
trap 'jobs -p | xargs -r kill' EXIT

# Run the demo
main

echo ""
echo "🎉 SecretVote demo completed successfully!"
echo ""
echo "📚 Learn more:"
echo "• Documentation: ./docs/"
echo "• GitHub: https://github.com/your-username/secretvote"
echo "• Zama docs: https://docs.zama.ai/fhevm"
echo ""
echo "Thank you for trying SecretVote! 🗳️"
