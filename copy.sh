git add .
git commit -m "update"
git push

cp -R _site/* ../vvoliucano.github.io/
cd ../vvoliucano.github.io/
git add .
git commit -m "update"
git push
