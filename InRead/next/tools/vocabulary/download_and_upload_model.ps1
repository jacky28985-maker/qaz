param(
  [string]$OutputRoot = 'C:\Users\Yangf\InRead\model-cache\qwen3-14b-awq',
  [string]$RemoteRoot = '/vepfs/queue010/public/inread-team2-models/qwen3-14b-awq'
)

$repo = 'Qwen/Qwen3-14B-AWQ'
$files = @(
  'config.json',
  'generation_config.json',
  'merges.txt',
  'model-00001-of-00002.safetensors',
  'model-00002-of-00002.safetensors',
  'model.safetensors.index.json',
  'tokenizer.json',
  'tokenizer_config.json',
  'vocab.json'
)

New-Item -ItemType Directory -Force -Path $OutputRoot | Out-Null
foreach ($file in $files) {
  $target = Join-Path $OutputRoot $file
  $url = "https://huggingface.co/$repo/resolve/main/${file}?download=true"
  Write-Output "download $file"
  & curl.exe --fail --location --ssl-no-revoke --continue-at - --retry 8 --retry-delay 3 --output $target $url
  if ($LASTEXITCODE -ne 0) { throw "Download failed: $file" }
}

Write-Output "upload model to $RemoteRoot"
ssh snxy-dev "mkdir -p $RemoteRoot"
if ($LASTEXITCODE -ne 0) { throw 'Could not create the remote model directory.' }
& scp.exe "$OutputRoot\*" "snxy-dev:$RemoteRoot/"
if ($LASTEXITCODE -ne 0) { throw 'Model upload failed.' }
Write-Output 'model upload complete'
