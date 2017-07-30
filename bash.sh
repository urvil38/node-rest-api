i=2600
while true;
do
curl -H "Content-Type: application/json" -X POST -d '{"name":"urvil","email":"urvilpatel'$i'@gmail.com","password":"pass"}' http://localhost/api/v1/users
let i=i+1
done
