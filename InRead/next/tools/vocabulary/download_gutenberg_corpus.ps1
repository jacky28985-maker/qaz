param(
  [string]$OutputRoot = "$PSScriptRoot\gutenberg-corpus"
)

$books = Get-Content (Join-Path $PSScriptRoot 'books.json') -Raw | ConvertFrom-Json
New-Item -ItemType Directory -Force -Path $OutputRoot | Out-Null

foreach ($book in $books) {
  $bookDir = Join-Path $OutputRoot $book.id
  $target = Join-Path $bookDir 'book.txt'
  New-Item -ItemType Directory -Force -Path $bookDir | Out-Null
  if ((Test-Path $target) -and (Get-Item $target).Length -gt 20000) {
    Write-Output "skip $($book.id) $($book.title)"
    continue
  }
  $urls = @(
    "https://www.gutenberg.org/files/$($book.id)/$($book.id)-0.txt",
    "https://www.gutenberg.org/cache/epub/$($book.id)/pg$($book.id).txt"
  )
  $downloaded = $false
  foreach ($url in $urls) {
    & curl.exe --fail --location --retry 4 --retry-delay 2 --output $target $url
    if ($LASTEXITCODE -eq 0 -and (Test-Path $target) -and (Get-Item $target).Length -gt 20000) {
      $downloaded = $true
      break
    }
  }
  if (-not $downloaded) { throw "Download failed for Gutenberg book $($book.id): $($book.title)" }
  Write-Output "downloaded $($book.id) $($book.title)"
}
