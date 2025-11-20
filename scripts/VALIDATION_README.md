# Documentation Validation Scripts

This directory contains automated validation scripts for the Devvit API documentation.

## Scripts

### validate-devvit-docs.js

Comprehensive validation script that checks:
- Priority API coverage (all requirements)
- Internal link validity
- Code example syntax
- Section completeness
- Metadata presence
- File size
- Platform constraints documentation

**Usage**:
```bash
node scripts/validate-devvit-docs.js
```

**Exit Codes**:
- `0`: All validations passed
- `1`: One or more validations failed

### test-navigation.js

Navigation and searchability testing script that checks:
- Table of Contents links
- Cross-reference links
- Category organization
- Method listings
- Search keyword coverage
- Code example searchability
- Section accessibility

**Usage**:
```bash
node scripts/test-navigation.js
```

**Exit Codes**:
- `0`: All tests passed (warnings allowed)
- `1`: One or more tests failed

## Running All Validations

To run both validation scripts:

```bash
npm run validate-docs
```

Or manually:

```bash
node scripts/validate-devvit-docs.js && node scripts/test-navigation.js
```

## Validation Workflow

1. **After Documentation Generation**:
   ```bash
   node scripts/generate-devvit-docs.js
   node scripts/validate-devvit-docs.js
   ```

2. **Before Committing Changes**:
   ```bash
   node scripts/validate-devvit-docs.js
   node scripts/test-navigation.js
   ```

3. **After Fixing Issues**:
   ```bash
   node scripts/validate-devvit-docs.js
   ```

## Understanding Results

### Validation Script Output

```
============================================================
1. Validating Priority API Coverage
============================================================
Checking Type Aliases:
  ✓ Context
  ✓ BaseContext
  ...

Total checks: 92
Passed: 92
Failed: 0
Success Rate: 100.0%

✅ Validation PASSED
```

### Navigation Script Output

```
============================================================
1. Testing Table of Contents Links
============================================================
Found 23 TOC links
  ✓ All 23 TOC links are valid

Total tests: 38
Passed: 34
Failed: 0
Warnings: 4
Success Rate: 89.5%

⚠️  Navigation tests PASSED with warnings
```

## Common Issues and Fixes

### Broken Links

**Issue**: `Broken internal link: Context & API Clients -> #context--api-clients`

**Fix**: Update the anchor in the Table of Contents to match the actual header format:
```markdown
- [Context & API Clients](#context-api-clients)  <!-- Remove extra hyphens -->
```

### Missing API Coverage

**Issue**: `Missing priority API: useState in Hooks`

**Fix**: Ensure the API is documented in the appropriate section with proper formatting.

### Code Example Errors

**Issue**: `Code example has mismatched braces`

**Fix**: Check TypeScript code blocks for syntax errors:
```typescript
// ❌ Wrong
function example() {
  return {
    value: 42
  // Missing closing brace

// ✅ Correct
function example() {
  return {
    value: 42
  };
}
```

### File Size Warning

**Issue**: `File size exceeds 1MB`

**Fix**: Consider splitting documentation into multiple files or removing redundant content.

## Adding New Validations

To add new validation checks:

1. Open `scripts/validate-devvit-docs.js`
2. Add a new section:
   ```javascript
   logSection('X. Your New Validation');
   
   // Your validation logic
   if (condition) {
     addPass();
   } else {
     addError('Error message');
   }
   ```

3. Update the validation report template in `docs/devvit-api-validation-report.md`

## CI/CD Integration

These scripts can be integrated into CI/CD pipelines:

```yaml
# .github/workflows/validate-docs.yml
name: Validate Documentation

on:
  pull_request:
    paths:
      - '.kiro/steering/devvit-complete-api-reference.md'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '22'
      - run: node scripts/validate-devvit-docs.js
      - run: node scripts/test-navigation.js
```

## Maintenance

### Updating Validation Rules

When Devvit API changes:

1. Update priority API lists in `validate-devvit-docs.js`
2. Update expected categories in `test-navigation.js`
3. Run validations to ensure they pass
4. Update this README if new checks are added

### Version Compatibility

These scripts are compatible with:
- Node.js 22.x or higher
- ES Modules (type: "module" in package.json)
- Devvit API version 0.12.x

## Troubleshooting

### Script Won't Run

**Error**: `ReferenceError: require is not defined`

**Solution**: Ensure package.json has `"type": "module"` and scripts use ES6 imports.

### False Positives

If validation reports false positives:

1. Check if the documentation format has changed
2. Update regex patterns in validation scripts
3. Add exceptions for special cases

### Performance Issues

If scripts run slowly:

1. Check file size of documentation
2. Optimize regex patterns
3. Consider caching results

## Support

For issues or questions:
1. Check this README
2. Review validation output carefully
3. Check the main documentation generation guide
4. Open an issue with validation output

---

**Last Updated**: 2025-11-19  
**Maintainer**: Development Team
