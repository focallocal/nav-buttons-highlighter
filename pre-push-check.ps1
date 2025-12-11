# Discourse Theme Component - Pre-Push Checklist (PowerShell)
# This script runs before pushing to ensure code quality and best practices
#
# To run manually: .\pre-push-check.ps1
# To use with git: Set up a pre-push hook that calls this script

param(
    [switch]$Fix = $false
)

$ErrorActionPreference = "Continue"

Write-Host "`n[CHECK] Running Discourse Theme Pre-Push Checks..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$script:errors = 0
$script:warnings = 0

function Write-Error-Custom($message) {
    Write-Host "[ERROR] $message" -ForegroundColor Red
    $script:errors++
}

function Write-Warning-Custom($message) {
    Write-Host "[WARN] WARNING: $message" -ForegroundColor Yellow
    $script:warnings++
}

function Write-Success($message) {
    Write-Host "[OK] $message" -ForegroundColor Green
}

# ============================================
# 1. CSS CHECKS
# ============================================
Write-Host "`n[CSS] Checking CSS/SCSS..." -ForegroundColor White

$scssFiles = Get-ChildItem -Path "common" -Filter "*.scss" -Recurse -ErrorAction SilentlyContinue

if ($scssFiles) {
    foreach ($file in $scssFiles) {
        $content = Get-Content $file.FullName -Raw
        
        # Check for rgba usage - should use rgb with slash syntax
        $rgbaPattern = 'rgba\s*\('
        if ($content -match $rgbaPattern) {
            Write-Error-Custom "Found rgba in $($file.Name). Use rgb with slash syntax instead."
        }
        
        # Check for hardcoded hex colors (but allow CSS variables)
        $lines = Get-Content $file.FullName
        $lineNum = 0
        $hexPattern = '#[0-9a-fA-F]{3,6}'
        $varPattern = 'var\(--'
        $commentPattern1 = '^\s*//'
        $commentPattern2 = '^\s*/\*'
        foreach ($line in $lines) {
            $lineNum++
            if (($line -match $hexPattern) -and ($line -notmatch $varPattern) -and ($line -notmatch $commentPattern1) -and ($line -notmatch $commentPattern2)) {
                Write-Warning-Custom "Hardcoded hex color at $($file.Name):$lineNum - consider using CSS variables"
            }
        }
        
        # Count !important
        $importantCount = ([regex]::Matches($content, "!important")).Count
        if ($importantCount -gt 10) {
            Write-Warning-Custom "Found $importantCount uses of !important in $($file.Name). Consider reducing."
        }
    }
    Write-Success "CSS variable usage checked"
}

# ============================================
# 2. JAVASCRIPT CHECKS
# ============================================
Write-Host "`n[JS] Checking JavaScript..." -ForegroundColor White

$jsFiles = Get-ChildItem -Path "javascripts" -Include "*.gjs","*.js" -Recurse -ErrorAction SilentlyContinue

if ($jsFiles) {
    $hasModifyClass = $false
    $hasPluginId = $false
    $hasWidgets = $false
    
    foreach ($file in $jsFiles) {
        $content = Get-Content $file.FullName -Raw
        
        # Check for modifyClass without pluginId
        if ($content -match "modifyClass") { $hasModifyClass = $true }
        if ($content -match "pluginId") { $hasPluginId = $true }
        
        # Check for deprecated widget usage
        if ($content -match "createWidget|api\.decorateWidget|api\.reopenWidget") {
            $hasWidgets = $true
            Write-Warning-Custom "Found deprecated widget API in $($file.Name). Consider migrating to Glimmer components."
        }
        
        # Check for template overrides (maintenance risk)
        if ($content -match "api\.modifyClassStatic|overrideTemplate|replaceComponent") {
            Write-Warning-Custom "Found template/component override in $($file.Name). Consider using plugin outlets instead for easier maintenance."
        }
    }
    
    if ($hasModifyClass -and -not $hasPluginId) {
        Write-Error-Custom "Using modifyClass without pluginId. Add pluginId for proper Ember ownership."
    }
    
    Write-Success "JavaScript patterns checked"
}

# ============================================
# 3. FILE STRUCTURE CHECKS
# ============================================
Write-Host "`n[FILES] Checking file structure..." -ForegroundColor White

if (-not (Test-Path "about.json")) {
    Write-Error-Custom "Missing about.json - required for theme metadata"
} else {
    $aboutJson = Get-Content "about.json" -Raw
    if ($aboutJson -notmatch "minimum_discourse_version") {
        Write-Warning-Custom "about.json missing minimum_discourse_version field"
    }
    if ($aboutJson -notmatch '"component"\s*:\s*true') {
        Write-Warning-Custom "about.json missing 'component: true' - is this a theme component?"
    }
    Write-Success "about.json exists and checked"
}

# Check settings.yml for good UX patterns
if (Test-Path "settings.yml") {
    $settingsContent = Get-Content "settings.yml" -Raw
    
    # Check if there's a list setting that looks like it takes category slugs but doesn't use list_type: category
    # Only warn if setting name contains "categor" AND it's a list type AND doesn't have list_type: category
    if ($settingsContent -match "categor[^:]*:\s*\n\s+type:\s*list" -and $settingsContent -notmatch "list_type:\s*category") {
        Write-Warning-Custom "settings.yml has category list setting - consider using 'list_type: category' for dropdown picker"
    }
    
    # Check if there's a list setting that looks like it takes group slugs but doesn't use list_type: group  
    if ($settingsContent -match "group[^:]*:\s*\n\s+type:\s*list" -and $settingsContent -notmatch "list_type:\s*group") {
        Write-Warning-Custom "settings.yml has group list setting - consider using 'list_type: group' for dropdown picker"
    }
    
    Write-Success "settings.yml patterns checked"
}

# ============================================
# 4. LINTING
# ============================================
Write-Host "`n[LINT] Running linters..." -ForegroundColor White

# Check if pnpm/npm is available
$hasNodeModules = Test-Path "node_modules"

if ($hasNodeModules) {
    # Run stylelint
    if (Test-Path "stylelint.config.mjs") {
        Write-Host "Running stylelint..."
        if ($Fix) {
            $result = & npx stylelint "common/**/*.scss" --fix 2>&1
        } else {
            $result = & npx stylelint "common/**/*.scss" 2>&1
        }
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "Stylelint found issues. Run: npx stylelint common/**/*.scss --fix"
            Write-Host $result -ForegroundColor DarkGray
        } else {
            Write-Success "Stylelint passed"
        }
    }
    
    # Run prettier
    if (Test-Path ".prettierrc.cjs") {
        Write-Host "Running prettier..."
        if ($Fix) {
            $result = & npx prettier --write "common/**/*.scss" "javascripts/**/*.gjs" 2>&1
            Write-Success "Prettier formatting applied"
        } else {
            $result = & npx prettier --check "common/**/*.scss" "javascripts/**/*.gjs" 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Error-Custom "Prettier found formatting issues. Run: npx prettier --write ."
            } else {
                Write-Success "Prettier check passed"
            }
        }
    }
    
    # Run eslint
    if (Test-Path "eslint.config.mjs") {
        Write-Host "Running eslint..."
        if ($Fix) {
            $result = & npx eslint "javascripts/**/*.gjs" "javascripts/**/*.js" --fix 2>&1
        } else {
            $result = & npx eslint "javascripts/**/*.gjs" "javascripts/**/*.js" 2>&1
        }
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "ESLint found issues. Run: npx eslint . --fix"
            Write-Host $result -ForegroundColor DarkGray
        } else {
            Write-Success "ESLint passed"
        }
    }
} else {
    Write-Warning-Custom "node_modules not found. Run 'pnpm install' to enable linting."
}

# ============================================
# 5. BEST PRACTICES REMINDERS
# ============================================
Write-Host "`n[INFO] Best Practices Checklist:" -ForegroundColor Cyan
Write-Host "   [ ] Use CSS variables: --primary, --secondary, --tertiary, --danger, --success" -ForegroundColor Gray
Write-Host "   [ ] Use rgb() not rgba(): rgb(var(--primary-rgb) / 0.5)" -ForegroundColor Gray
Write-Host "   [ ] Use .gjs files for new components (Glimmer/Ember Octane)" -ForegroundColor Gray
Write-Host "   [ ] Use api.renderInOutlet() - avoid template overrides" -ForegroundColor Gray
Write-Host "   [ ] Use list_type: category/group in settings.yml for dropdowns" -ForegroundColor Gray
Write-Host "   [ ] Use BEM naming: .block__element.--modifier" -ForegroundColor Gray
Write-Host "   [ ] Use additive CSS (override, don't replace)" -ForegroundColor Gray
Write-Host "   [ ] Test on mobile and desktop" -ForegroundColor Gray
Write-Host "   [ ] Test with dark mode enabled" -ForegroundColor Gray
Write-Host "   [ ] Squash commits before PR: git reset --soft upstream/main; git commit" -ForegroundColor Gray

# ============================================
# SUMMARY
# ============================================
Write-Host "`n================================================" -ForegroundColor Cyan

if ($script:errors -gt 0) {
    Write-Host "[FAILED] Pre-push check FAILED: $($script:errors) error(s), $($script:warnings) warning(s)" -ForegroundColor Red
    Write-Host "Fix errors before pushing, or use: git push --no-verify" -ForegroundColor Red
    exit 1
} elseif ($script:warnings -gt 0) {
    Write-Host "[WARN] Pre-push check passed with $($script:warnings) warning(s)" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "[PASSED] All pre-push checks passed!" -ForegroundColor Green
    exit 0
}
