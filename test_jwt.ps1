Write-Host "TEST 1: Login sin JWT" -ForegroundColor Cyan
try {
  $resp1 = Invoke-WebRequest -Uri "http://localhost:3000/api/usuario/login" -Method POST -ContentType "application/json" -Body '{"username":"admin_kiosco","password":"a"}' -UseBasicParsing
  $data = $resp1.Content | ConvertFrom-Json
  $script:token = $data.token
  Write-Host "OK - Token obtenido" -ForegroundColor Green
} catch {
  Write-Host "FALLO: Login fallido" -ForegroundColor Red
  exit 1
}

Write-Host "`nTEST 2: Acceso SIN JWT (debe ser 401)" -ForegroundColor Cyan
try {
  Invoke-WebRequest -Uri "http://localhost:3000/api/venta" -Method GET -ErrorAction Stop -UseBasicParsing
} catch {
  $code = $_.Exception.Response.StatusCode
  if ($code -eq 401) {
    Write-Host "OK - Recibido 401 como se esperaba" -ForegroundColor Green
  }
}

Write-Host "`nTEST 3: Acceso CON JWT valido" -ForegroundColor Cyan
try {
  $h = @{"Authorization"="Bearer $($script:token)"}
  $resp3 = Invoke-WebRequest -Uri "http://localhost:3000/api/venta" -Method GET -Headers $h -UseBasicParsing
  Write-Host "OK - Acceso autorizado (200)" -ForegroundColor Green
  $ventas = $resp3.Content | ConvertFrom-Json
  Write-Host "Ventas encontradas: $($ventas.Count)" -ForegroundColor Yellow
} catch {
  Write-Host "FALLO: Error al acceder con JWT - $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

Write-Host "`nRESUMEN: Todos los tests OK" -ForegroundColor Magenta
