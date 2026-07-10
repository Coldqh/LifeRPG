PRIME RPG — GitHub Pages workflow patch

1. Распакуй архив прямо в:
   C:\PrimeRPG

2. Подтверди замену файла:
   .github\workflows\pages.yml

3. Выполни:
   cd C:\PrimeRPG
   git add .github/workflows/pages.yml
   git commit -m "Update GitHub Pages workflow"
   git push

Если предыдущий deployment завис на purging_cdn, после push запустится новый workflow.
