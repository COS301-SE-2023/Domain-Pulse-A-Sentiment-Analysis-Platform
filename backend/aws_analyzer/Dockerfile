FROM public.ecr.aws/lambda/python:3.9

# this is the only writable directory in the aws lambda environment
# sets where the ntlk stuff hugging face models download
ENV HF_HOME /tmp

# Copy requirements.txt
COPY requirements.txt ${LAMBDA_TASK_ROOT}

# Install the specified packages
RUN pip install --no-cache-dir -r requirements.txt

# Install the nltk data to the docker image
RUN mkdir /usr/share/nltk_data
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"

# Copy code
# this could probrably be done with a COPY . ${LAMBDA_TASK_ROOT}
COPY handler.py ${LAMBDA_TASK_ROOT}
COPY preprocessor ${LAMBDA_TASK_ROOT}/preprocessor
COPY processor ${LAMBDA_TASK_ROOT}/processor

#install the huggingface models to the docker image
RUN python ${LAMBDA_TASK_ROOT}/processor/nn_models.py

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "handler.analyze" ]