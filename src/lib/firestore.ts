import { db } from './firebase';
import { collection, addDoc, getDocs, getDoc, doc, query, orderBy } from 'firebase/firestore';
import type { Appointment } from './types';

const APPOINTMENTS_COLLECTION = 'appointments';

// Add a new appointment to Firestore
export async function addAppointment(appointmentData: Omit<Appointment, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, APPOINTMENTS_COLLECTION), appointmentData);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Could not save appointment.');
  }
}

// Get all appointments from Firestore
export async function getAppointments(): Promise<Appointment[]> {
  try {
    const q = query(collection(db, APPOINTMENTS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];
    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() } as Appointment);
    });
    return appointments;
  } catch (e) {
    console.error('Error getting documents: ', e);
    throw new Error('Could not fetch appointments.');
  }
}

// Get a single appointment by its ID
export async function getAppointmentById(id: string): Promise<Appointment | null> {
    try {
        const docRef = doc(db, APPOINTMENTS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Appointment;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (e) {
        console.error("Error getting document:", e);
        throw new Error("Could not fetch appointment.");
    }
}
