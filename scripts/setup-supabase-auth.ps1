param(
  [Parameter(Mandatory)]
  [string]$SupabaseAccessToken,

  [Parameter(Mandatory)]
  [string]$ProjectRef = "qnmhepqaotbtnepdofap",

  [string]$GoogleClientId = "",
  [string]$GoogleClientSecret = "",
  [string]$GithubClientId = "",
  [string]$GithubClientSecret = "",
  [switch]$EnableGoogle,
  [switch]$EnableGithub
)

$ErrorActionPreference = "Stop"
$ApiBase = "https://api.supabase.com/v1/projects/$ProjectRef/config/auth"

Write-Host "=== Supabase Auth Provider Setup ===" -ForegroundColor Cyan
Write-Host "Project Ref: $ProjectRef" -ForegroundColor Gray

# Build the request body
$body = @{}

if ($EnableGoogle -and $GoogleClientId -and $GoogleClientSecret) {
  $body["external_google_enabled"] = $true
  $body["external_google_client_id"] = $GoogleClientId
  $body["external_google_secret"] = $GoogleClientSecret
  Write-Host "[Google] Will enable with Client ID: $GoogleClientId" -ForegroundColor Green
}

if ($EnableGithub -and $GithubClientId -and $GithubClientSecret) {
  $body["external_github_enabled"] = $true
  $body["external_github_client_id"] = $GithubClientId
  $body["external_github_secret"] = $GithubClientSecret
  Write-Host "[GitHub] Will enable with Client ID: $GithubClientId" -ForegroundColor Green
}

if ($body.Count -eq 0) {
  Write-Host "ERROR: No provider configured. Use -EnableGoogle or -EnableGithub with corresponding ClientId/Secret." -ForegroundColor Red
  exit 1
}

Write-Host "Sending request to Supabase Management API..." -ForegroundColor Yellow

try {
  $response = Invoke-RestMethod -Uri $ApiBase `
    -Method Patch `
    -Headers @{
      "Authorization" = "Bearer $SupabaseAccessToken"
      "Content-Type"  = "application/json"
    } `
    -Body ($body | ConvertTo-Json)

  Write-Host "SUCCESS! Auth providers configured." -ForegroundColor Green
  Write-Host "Response: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor Gray
} catch {
  Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
  if ($_.Exception.Response) {
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $errorBody = $reader.ReadToEnd()
    $reader.Close()
    Write-Host "Response body: $errorBody" -ForegroundColor Red
  }
  exit 1
}
