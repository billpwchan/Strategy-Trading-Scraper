do{
    Set-Location -Path C:\Users\billpwchan\Desktop\Strategy-Trading-Scraper
    node ./index.js
    git add .
    git commit -m "Update Files"
    git push
    start-sleep -Seconds 120
}until($infinity)