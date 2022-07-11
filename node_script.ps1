do{
    Set-Location -Path C:\Users\Administrator\Desktop\Strategy-Trading-Scraper
    node ./index.js
    git add .
    git commit -m "Update Files"
    git push
    start-sleep -Seconds 900
}until($infinity)