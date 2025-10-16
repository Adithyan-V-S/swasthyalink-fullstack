# Contributing to Swasthyalink

Thank you for your interest in contributing to Swasthyalink! We welcome contributions from the community to help improve this digital healthcare platform.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be respectful**: Treat all contributors with respect and kindness
- **Be inclusive**: Welcome newcomers and help them get started
- **Be collaborative**: Work together to solve problems and improve the project
- **Be professional**: Maintain a professional tone in all communications

## How to Contribute

### Reporting Issues

1. **Search existing issues** first to avoid duplicates
2. **Use the issue template** when creating new issues
3. **Provide detailed information** including:
   - Steps to reproduce the problem
   - Expected vs actual behavior
   - Screenshots or error messages
   - Environment details (browser, OS, etc.)

### Suggesting Features

1. **Check the roadmap** to see if the feature is already planned
2. **Create a feature request** with detailed description
3. **Explain the use case** and why it would be valuable
4. **Consider implementation complexity** and alternatives

### Development Process

#### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/adithyan-v-s/Swasthyalink.git
cd Swasthyalink
```

#### 2. Set Up Development Environment

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up Firebase configuration
# Copy firebaseConfig.example.js to firebaseConfig.js
# Add your Firebase credentials
```

#### 3. Create a Branch

```bash
# Create a new branch for your feature/fix
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

#### 4. Make Changes

- **Follow coding standards** (see below)
- **Write clear commit messages**
- **Add tests** for new functionality (when test suite is available)
- **Update documentation** as needed

#### 5. Test Your Changes

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Test the application
npm run dev
```

#### 6. Submit Pull Request

1. **Push your branch** to your fork
2. **Create a pull request** from your branch to the main repository
3. **Fill out the PR template** completely
4. **Link related issues** using keywords (fixes #123)
5. **Request review** from maintainers

## Coding Standards

### JavaScript/React

- **Use functional components** with hooks
- **Follow React best practices**:
  - Use proper prop types (when TypeScript is added)
  - Implement proper error boundaries
  - Optimize re-renders with useMemo/useCallback when needed
- **Use meaningful variable names**
- **Write self-documenting code** with clear function names
- **Add comments** for complex logic only

### CSS/Styling

- **Use Tailwind CSS** utility classes
- **Follow mobile-first** responsive design
- **Use semantic HTML** elements
- **Ensure accessibility** (WCAG 2.1 AA compliance)
- **Test across browsers** and devices

### File Organization

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Modal, etc.)
│   ├── forms/          # Form-specific components
│   └── layout/         # Layout components (Header, Footer, etc.)
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── constants/          # Application constants
├── services/           # API and external service integrations
└── assets/             # Static assets
```

### Commit Messages

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add password reset functionality
fix(dashboard): resolve QR code generation issue
docs(readme): update installation instructions
```

## Review Process

### For Contributors

- **Be patient**: Reviews may take time
- **Be responsive**: Address feedback promptly
- **Be open**: Accept constructive criticism
- **Be thorough**: Test your changes thoroughly

### For Reviewers

- **Be constructive**: Provide helpful feedback
- **Be specific**: Point out exact issues and suggest solutions
- **Be timely**: Review PRs in a reasonable timeframe
- **Be encouraging**: Recognize good work and improvements

## Security

- **Never commit sensitive data** (API keys, passwords, etc.)
- **Use environment variables** for configuration
- **Follow security best practices** for authentication and data handling
- **Report security issues** privately to the maintainers

## Documentation

- **Update README** files when adding new features
- **Add inline documentation** for complex functions
- **Update API documentation** when changing endpoints
- **Include examples** in documentation

## Getting Help

- **Join our community** discussions
- **Ask questions** in issues or discussions
- **Check existing documentation** first
- **Be specific** about what you need help with

## Recognition

Contributors will be recognized in:
- **Contributors section** of the README
- **Release notes** for significant contributions
- **Special mentions** in project updates

Thank you for contributing to Swasthyalink and helping improve healthcare technology!
