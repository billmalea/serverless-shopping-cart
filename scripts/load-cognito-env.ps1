# Loads values from .env.cognito into the current PowerShell session environment variables
$envFile = Join-Path $PSScriptRoot '..\.env.cognito'
if (-Not (Test-Path $envFile)) {
  Write-Error "Env file not found: $envFile"
  exit 1
}

Get-Content $envFile | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith('#')) { return }
  $idx = $line.IndexOf('=')
  if ($idx -lt 0) { return }
  $name = $line.Substring(0,$idx)
  $value = $line.Substring($idx+1)
  # Use Set-Item to assign to the Env: provider (works with dynamic names)
  Set-Item -Path ("Env:" + $name) -Value $value
  Write-Output "Set $name"
}

Write-Output "Loaded environment variables from $envFile"