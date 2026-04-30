SELECT 
    d.*
FROM users u
LEFT JOIN doleance d ON (
      (u.region = d.region AND u.district IS NULL AND u.commune IS NULL)
   OR (u.region = d.region AND u.district = d.district AND u.commune IS NULL)
   OR (u.region = d.region AND u.district = d.district AND u.commune = d.commune)
)
WHERE u.id = '116a5092-d4b8-4b87-b6dc-ff86ba8b5f07'
  AND EXTRACT(MONTH FROM d.created_at) = 12
  AND EXTRACT(YEAR FROM d.created_at) = 2025
ORDER BY d.created_at DESC;