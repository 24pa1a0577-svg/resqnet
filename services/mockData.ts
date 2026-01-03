
import { UserRole, DisasterStatus, Severity, User, Disaster, Task, ResourceRequest, EmergencyAlert, HelpRequest, ChatMessage } from '../types';

const USERS_KEY = 'resqnet_users';
const DISASTERS_KEY = 'resqnet_disasters';
const TASKS_KEY = 'resqnet_tasks';
const REQUESTS_KEY = 'resqnet_requests';
const ALERTS_KEY = 'resqnet_alerts';
const HELP_REQUESTS_KEY = 'resqnet_help_requests';
const CHATS_KEY = 'resqnet_chats';

const initialUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'citizen@resqnet.com', role: UserRole.CITIZEN },
  { id: '2', name: 'Volunteer Alex', email: 'alex@vol.com', role: UserRole.VOLUNTEER, isOnline: true },
  { id: '5', name: 'Volunteer Maya', email: 'maya@vol.com', role: UserRole.VOLUNTEER, isOnline: false },
  { id: '6', name: 'Volunteer Liam', email: 'liam@vol.com', role: UserRole.VOLUNTEER, isOnline: true },
  { id: '3', name: 'NGO Sarah', email: 'sarah@ngo.org', role: UserRole.NGO },
  { id: '7', name: 'Red Cross Team', email: 'rc@ngo.org', role: UserRole.NGO },
  { id: '4', name: 'Gov Mike', email: 'mike@gov.in', role: UserRole.GOVERNMENT }
];

const initialDisasters: Disaster[] = [
  {
    id: 'd1',
    type: 'Flash Flood',
    description: 'Heavy rainfall causing waterlogging in the downtown area. Basement flooding reported in multiple blocks.',
    location: 'Sector 7, Downtown',
    severity: Severity.HIGH,
    status: DisasterStatus.REPORTED,
    reportedBy: '1',
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: 'd2',
    type: 'Building Collapse',
    description: 'Old residential building partially collapsed after tremor. Possible casualties trapped under debris.',
    location: 'Old Town Square',
    severity: Severity.CRITICAL,
    status: DisasterStatus.IN_PROGRESS,
    reportedBy: '1',
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    id: 'd3',
    type: 'Wildfire',
    description: 'Dry brush fire spreading towards the residential fringe of the West Forest.',
    location: 'West Forest Border',
    severity: Severity.HIGH,
    status: DisasterStatus.VERIFIED,
    reportedBy: '1',
    createdAt: new Date(Date.now() - 7200000)
  },
  {
    id: 'd4',
    type: 'Earthquake',
    description: 'Magnitude 5.2 earthquake hit the northern suburbs. Infrastructure assessment required.',
    location: 'North Hill Area',
    severity: Severity.CRITICAL,
    status: DisasterStatus.RESOLVED,
    reportedBy: '4',
    createdAt: new Date(Date.now() - 604800000) 
  }
];

const initialTasks: Task[] = [
  {
    id: 't1',
    disasterId: 'd2',
    ngoId: '3',
    volunteerId: '2',
    description: 'Search and rescue operation in the north wing of the collapsed building.',
    status: 'Accepted',
    createdAt: new Date()
  },
  {
    id: 't2',
    disasterId: 'd1',
    ngoId: '3',
    volunteerId: '2',
    description: 'Evacuation assistance for elderly residents in Block B.',
    status: 'Completed',
    createdAt: new Date(Date.now() - 5000000)
  },
  {
    id: 't3',
    disasterId: 'd3',
    ngoId: '7',
    description: 'Creating a firebreak near the main water station.',
    status: 'Pending',
    createdAt: new Date()
  },
  {
    id: 't4',
    disasterId: 'd1',
    ngoId: '7',
    volunteerId: '2',
    description: 'Food distribution at the relief camp in Sector 7.',
    status: 'Completed',
    createdAt: new Date(Date.now() - 172800000) 
  },
  {
    id: 't5',
    disasterId: 'd4',
    ngoId: '3',
    volunteerId: '2',
    description: 'Preliminary structural safety assessment of community center.',
    status: 'Completed',
    createdAt: new Date(Date.now() - 518400000) 
  }
];

const initialRequests: ResourceRequest[] = [
  {
    id: 'r1',
    ngoId: '3',
    type: 'Heavy Machinery',
    quantity: '2 Excavators',
    status: 'Pending',
    description: 'Required for debris removal at the Old Town building collapse site.',
    createdAt: new Date()
  },
  {
    id: 'r2',
    ngoId: '7',
    type: 'Medical Supplies',
    quantity: '500 First Aid Kits',
    status: 'Approved',
    description: 'Emergency stockpiling for flood-affected families.',
    createdAt: new Date(Date.now() - 3600000)
  }
];

const initialHelpRequests: HelpRequest[] = [
  {
    id: 'h1',
    userId: '1',
    type: 'Medical',
    description: 'Inhaled smoke during wildfire. Need oxygen support.',
    location: 'Apt 402, West Forest fringe',
    status: 'Pending',
    createdAt: new Date()
  }
];

const initialAlerts: EmergencyAlert[] = [
  {
    id: 'a1',
    title: 'Severe Weather Warning',
    message: 'A heavy storm is expected in the next 3 hours. Stay indoors.',
    severity: Severity.HIGH,
    issuer: 'Gov Mike',
    createdAt: new Date()
  }
];

const initialChats: ChatMessage[] = [
  {
    id: 'c1',
    senderId: '4', // Gov Mike
    receiverId: '3', // NGO Sarah
    text: 'Sarah, we have authorized the extra excavators for the downtown site. Ensure field teams have safety clearance.',
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: 'c2',
    senderId: '3', // NGO Sarah
    receiverId: '4', // Gov Mike
    text: 'Understood, Mike. Teams are mobilizing. We will update the status in the portal by 18:00.',
    timestamp: new Date(Date.now() - 1800000)
  },
  {
    id: 'c3',
    senderId: '2', // Volunteer Alex
    receiverId: '1', // Citizen John Doe
    text: 'Hello John, I am on my way to Sector 7. Can you confirm the street number?',
    timestamp: new Date(Date.now() - 1800000)
  }
];

export const storage = {
  get: <T,>(key: string, initial: T): T => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : initial;
  },
  set: (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  },
  initialize: () => {
    if (!localStorage.getItem(USERS_KEY)) storage.set(USERS_KEY, initialUsers);
    if (!localStorage.getItem(DISASTERS_KEY)) storage.set(DISASTERS_KEY, initialDisasters);
    if (!localStorage.getItem(TASKS_KEY)) storage.set(TASKS_KEY, initialTasks);
    if (!localStorage.getItem(REQUESTS_KEY)) storage.set(REQUESTS_KEY, initialRequests);
    if (!localStorage.getItem(ALERTS_KEY)) storage.set(ALERTS_KEY, initialAlerts);
    if (!localStorage.getItem(HELP_REQUESTS_KEY)) storage.set(HELP_REQUESTS_KEY, initialHelpRequests);
    if (!localStorage.getItem(CHATS_KEY)) storage.set(CHATS_KEY, initialChats);
  }
};

export { USERS_KEY, DISASTERS_KEY, TASKS_KEY, REQUESTS_KEY, ALERTS_KEY, HELP_REQUESTS_KEY, CHATS_KEY };
