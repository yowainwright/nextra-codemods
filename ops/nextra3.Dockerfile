FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache subversion
RUN svn export https://github.com/code-hike/examples/trunk/with-nextra-3 .

RUN npm install
RUN npm install -g jscodeshift

COPY ./dist /app/dist
COPY ./ops/scripts/start.sh /app/start.sh

RUN chmod +x /app/start.sh

EXPOSE 3000

CMD ["/app/start.sh"]
