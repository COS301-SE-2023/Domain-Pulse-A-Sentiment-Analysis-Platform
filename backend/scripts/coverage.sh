project1="../backend/engine"
project2="../backend/profilemanager"
project3="../backend/warehouse"

cd $project1
coverage run --source='.' manage.py test
coverage report -m
coverage xml -o coverage.xml
cd ..
ls

cd $project2
coverage run --source='.' manage.py test
coverage report -m
coverage xml -o coverage.xml
cd ..

cd $project3
coverage run --source='.' manage.py test
coverage report -m
coverage xml -o coverage.xml
cd ..

coverage combine engine/.coverage profilemanager/.coverage warehouse/.coverage
coverage report -m
coverage html -d coverage_html
coverage lcov -o coverage.lcov
