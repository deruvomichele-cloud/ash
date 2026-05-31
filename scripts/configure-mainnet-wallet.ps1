$ErrorActionPreference = "Stop"

$envPath = Join-Path $PSScriptRoot "..\.env"
$secureKey = Read-Host "Incolla la private key del NUOVO wallet mainnet (input nascosto)" -AsSecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)

try {
    $privateKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer).Trim()
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
}

if ($privateKey -notmatch "^0x[0-9a-fA-F]{64}$") {
    throw "Formato non valido: servono 0x seguito da 64 caratteri esadecimali."
}

$content = Get-Content -LiteralPath $envPath -Raw
if ($content -notmatch "(?m)^MAINNET_WALLET_PRIVATE_KEY=") {
    throw "MAINNET_WALLET_PRIVATE_KEY non trovato in .env."
}

$updated = $content -replace "(?m)^MAINNET_WALLET_PRIVATE_KEY=.*$", "MAINNET_WALLET_PRIVATE_KEY=$privateKey"
Set-Content -LiteralPath $envPath -Value $updated -NoNewline

Write-Output "Chiave mainnet salvata localmente in .env."
Write-Output "Ora esegui: npm run ready:base-mainnet"
