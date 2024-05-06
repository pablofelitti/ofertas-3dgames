FROM public.ecr.aws/lambda/nodejs:18.2023.11.18.01

COPY . ./

RUN npm install

CMD ["src/app.lambdaHandler"]

EXPOSE 3000