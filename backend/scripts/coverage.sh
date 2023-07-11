echo "d" | python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"

project1="../backend/engine"
project2="../backend/profiles"
project3="../backend/warehouse"
project4="../backend/sourceconnector"
project5="../backend/domains"

cd $project1
coverage run --source='.' manage.py test
coverage report -m
cd ..
ls

cd $project2
coverage run --source='.' manage.py test
coverage report -m
cd ..

cd $project3
coverage run --source='.' manage.py test
coverage report -m
cd ..

cd $project4
coverage run --source='.' manage.py test
coverage report -m
cd ..

cd $project5
coverage run --source='.' manage.py test
coverage report -m
cd ..

coverage combine engine/.coverage profiles/.coverage warehouse/.coverage sourceconnector/.coverage domains/.coverage
coverage report -m
coverage html -d coverage_html
coverage lcov -o coverage.lcov