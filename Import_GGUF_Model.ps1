# Ollama GGUF Model Importer
# Run this script directly on Windows (not in Docker)

$modelsPath = "F:\TITAN_MODELS"

Write-Host "`n=== Ollama GGUF Importer ===" -ForegroundColor Cyan
Write-Host "Scanning $modelsPath for GGUF files...`n"

# Get all GGUF files
$files = Get-ChildItem -Path $modelsPath -Filter "*.gguf" -File

if ($files.Count -eq 0) {
    Write-Host "No .gguf files found in $modelsPath" -ForegroundColor Red
    exit
}

# Display numbered list
Write-Host "Available models:" -ForegroundColor Yellow
for ($i = 0; $i -lt $files.Count; $i++) {
    $sizeMB = [math]::Round($files[$i].Length / 1MB, 0)
    Write-Host "  [$($i + 1)] $($files[$i].Name) ($sizeMB MB)"
}

# Get user selection
Write-Host ""
$selection = Read-Host "Enter number to import (or 'q' to quit)"

if ($selection -eq 'q') { exit }

$index = [int]$selection - 1
if ($index -lt 0 -or $index -ge $files.Count) {
    Write-Host "Invalid selection" -ForegroundColor Red
    exit
}

$selectedFile = $files[$index]
Write-Host "`nSelected: $($selectedFile.Name)" -ForegroundColor Green

# Suggest a model name
$suggestedName = $selectedFile.BaseName -replace '[^a-zA-Z0-9-]', '-' -replace '-+', '-'
$suggestedName = $suggestedName.ToLower()

$modelName = Read-Host "Enter model name for Ollama (default: $suggestedName)"
if ([string]::IsNullOrWhiteSpace($modelName)) {
    $modelName = $suggestedName
}

# Validate model name
$modelName = $modelName.ToLower() -replace '[^a-z0-9-]', '-' -replace '-+', '-'

Write-Host "`nImporting as '$modelName'..." -ForegroundColor Cyan
Write-Host "This may take a moment for large models.`n"

# Run ollama create
$filePath = $selectedFile.FullName
ollama create $modelName --file $filePath

Write-Host "`n=== Done! ===" -ForegroundColor Green
Write-Host "Use model with: ollama run $modelName"
Write-Host "Or select it in Scene Architect's Model Selector`n"

Read-Host "Press Enter to exit"
