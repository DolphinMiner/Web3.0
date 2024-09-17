rm -rf ./**/*.zip

cd ./BlkDiamond
cd ./Background && rm -rf *.zip && zip -r Background.zip ./*.png
cd ..
cd ./Pattern && rm -rf *.zip && zip -r Pattern.zip ./*.png
cd ..
cd ./Number
cd ./HundredsPlace && rm -rf *.zip && zip -r HundredsPlace.zip ./*.png
cd ..
cd ./TensPlace && rm -rf *.zip && zip -r TensPlace.zip ./*.png
cd ..
cd ./OnesPlace && rm -rf *.zip && zip -r OnesPlace.zip ./*.png

cd ../../../Platinum
cd ./Background && rm -rf *.zip && zip -r Background.zip ./*.png
cd ..
cd ./Pattern && rm -rf *.zip && zip -r Pattern.zip ./*.png
cd ..
cd ./Number
cd ./HundredsPlace && rm -rf *.zip && zip -r HundredsPlace.zip ./*.png
cd ..
cd ./TensPlace && rm -rf *.zip && zip -r TensPlace.zip ./*.png
cd ..
cd ./OnesPlace && rm -rf *.zip && zip -r OnesPlace.zip ./*.png

cd ../../../Gold
cd ./Background && rm -rf *.zip && zip -r Background.zip ./*.png
cd ..
cd ./Pattern && rm -rf *.zip && zip -r Pattern.zip ./*.png
cd ..
cd ./Number
cd ./HundredsPlace && rm -rf *.zip && zip -r HundredsPlace.zip ./*.png
cd ..
cd ./TensPlace && rm -rf *.zip && zip -r TensPlace.zip ./*.png
cd ..
cd ./OnesPlace && rm -rf *.zip && zip -r OnesPlace.zip ./*.png
