# Changelog

All notable changes to the Steelman - Perspective Engine project.

## [Final Version] - 2026-02-08

### Added
- Evidence items with linked sources - Sources now appear directly under each evidence point
- Enhanced JSON repair system - Multi-strategy JSON parsing and repair
- Comprehensive error handling - Better error messages and recovery
- Improved AI prompts - Strict JSON formatting requirements
- Date utility functions - Consistent date formatting across the app
- About page - Information about Steelman technique
- Copy functionality - Copy claim and argument text
- History sidebar - Quick access with search and filtering
- Dark/Light mode - Theme toggle with system preference
- Deployment guides - Complete documentation for multiple platforms

### Fixed
- TypeScript compilation errors - Removed unused variables, added type annotations
- JSON parsing errors - Enhanced repair strategies for malformed JSON
- Missing comma detection - Automatic fixing of missing commas in arrays/objects
- Hydration errors - Fixed server/client mismatch in React components
- Cache history loss - Improved cache retention and cleanup logic
- Inconsistent date formats - Centralized date formatting utilities
- CORS configuration - Proper backend CORS setup for frontend domains

### Improved
- JSON repair robustness - Multiple repair strategies with fallbacks
- Source linking - Evidence items now have associated sources
- Error messages - More helpful and actionable error messages
- Code quality - Better type safety and error handling
- Documentation - Comprehensive guides for deployment and setup
- UI/UX - Improved visual hierarchy and readability
- Performance - Better caching and optimization

### Changed
- Evidence structure - Now supports sources per evidence item
- JSON parsing - More aggressive repair strategies
- Prompt structure - Enhanced JSON formatting requirements
- Date display - Consistent formatting across all components

### Security
- Rate limiting - API protection against abuse
- Input validation - Proper validation of user inputs
- Error handling - No sensitive information leaked in errors

---

## Previous Versions

### [Initial Release]
- Basic fact-checking functionality
- AI-powered counter-arguments
- Article analysis
- Source search integration
- Basic caching
- Rate limiting

---

**For detailed change history, see git commit log.**
