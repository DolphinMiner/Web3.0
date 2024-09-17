rm -rf ./**/*.zip

cd ./01-Backgrounds && rm -rf *.zip && zip -r Background.zip ./*.png
cd ..
cd ./02-Skins && rm -rf *.zip && zip -r Skin.zip ./*.png
cd ..
cd ./03-Emoji && rm -rf *.zip && zip -r Emoji.zip ./*.png
cd ..
cd ./04-Bodys && rm -rf *.zip && zip -r Body.zip ./*.png
cd ..
cd ./05-Heads && rm -rf *.zip && zip -r Head.zip ./*.png
cd ..
cd ./06-Items && rm -rf *.zip && zip -r Item.zip ./*.png
