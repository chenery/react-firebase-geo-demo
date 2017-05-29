import firebase from 'firebase'
import {firebaseConfig} from '../config'

firebase.initializeApp(firebaseConfig);
const FirebaseAuth = firebase.auth;

export default FirebaseAuth;
