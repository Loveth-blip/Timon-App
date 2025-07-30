import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  user
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  collectionData,
  docData,
  query,
  where,
  orderBy, // <-- add this import
  DocumentData,
  WithFieldValue
} from '@angular/fire/firestore';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from '@angular/fire/storage';
import { Observable, from, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private storage: Storage
  ) { }

  // Authentication methods
  getCurrentUser() {
    return user(this.auth);
  }

  signUp(email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  signIn(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  signOut() {
    return from(signOut(this.auth));
  }

  // Firestore methods
  getCollection<T>(collectionName: string): Observable<T[]> {
    const collectionRef = collection(this.firestore, collectionName);
    return collectionData(collectionRef, { idField: 'id' }) as Observable<T[]>;
  }

  getDocument<T>(collectionName: string, id: string): Observable<T> {
    const documentRef = doc(this.firestore, `${collectionName}/${id}`);
    return docData(documentRef, { idField: 'id' }) as Observable<T>;
  }

  getFilteredCollection<T>(collectionName: string, field: string, value: any): Observable<T[]> {
    const collectionRef = collection(this.firestore, collectionName);
    // Add orderBy for 'createdAt' descending
    const q = query(
      collectionRef,
      where(field, '==', value),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<T[]>;
  }

  addDocument<T extends DocumentData>(collectionName: string, data: WithFieldValue<T>) {
    const collectionRef = collection(this.firestore, collectionName);
    return from(addDoc(collectionRef, data));
  }

  updateDocument<T extends DocumentData>(collectionName: string, id: string, data: Partial<T>) {
    const documentRef = doc(this.firestore, `${collectionName}/${id}`);
    return from(updateDoc(documentRef, data as any));
  }

  deleteDocument(collectionName: string, id: string) {
    const documentRef = doc(this.firestore, `${collectionName}/${id}`);
    return from(deleteDoc(documentRef));
  }

  // Storage methods
  uploadFile(path: string, file: File): Observable<string> {
    const storageRef = ref(this.storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Observable<string>(observer => {
      uploadTask.on('state_changed',
        (snapshot) => {
          // Progress monitoring if needed
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          // Handle unsuccessful uploads
          observer.error(error);
        },
        () => {
          // Handle successful uploads
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            observer.next(downloadURL);
            observer.complete();
          });
        }
      );
    });
  }

  deleteFile(path: string): Observable<void> {
    const storageRef = ref(this.storage, path);
    return from(deleteObject(storageRef));
  }
}
