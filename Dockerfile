FROM mhart/alpine-node
WORKDIR node-login/

COPY package.json /node-login
RUN npm i -g nodemon
RUN npm install
COPY . node-login/
EXPOSE 8080
CMD ["npm", "start"]



