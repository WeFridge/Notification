const admin = require("firebase-admin");
const serviceAccount = require('./service-account-file.json');
admin.initializeApp({credential: admin.credential.cert(serviceAccount)});
const db= admin.firestore();
//sets the date to check each items best_by date
const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)

async function getDBstuff(db) {
  // [START firestore_query_filter_eq_string]
  const itemDb = db.collection('items');
  const items = itemDb.where('best_by', '<=', tomorrow);
  // [END firestore_query_filter_eq_string]
  const allItems = await items.get();
  const messages=[]
  allItems.forEach(doc =>{
  //console.log(doc.id, ' => ', doc.data());
    const owner = doc.get('owner').id
    const item_name =  doc.get('name')
    const best_by =  doc.get('best_by').toDate().toISOString().slice(0,10)
    //creates the payload für the message
    var payload = {
      notification: {
        title:"Hey Listen",
        body:"Your "+ item_name+" is about to expire on the "+best_by
      },
      android:{
        notification:{
          channelId:"notification_channel",
        }
      },
      data:{
        id:"35"
      },
      topic: owner
    };
    messages.push(payload)

  });
  admin.messaging().sendAll(messages)
    .then((response) => {
      console.log('Successfully sent messages:', response.successCount);})
    .catch(function(error) {
      console.log("Error sending message:", error);
    });
}
getDBstuff(db)