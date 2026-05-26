// src/data/constants.js
export const ROLES = {
  BISHOP: 'bishop', ADMIN: 'admin', PASTOR: 'pastor',
  DEPARTMENT_LEADER: 'department_leader', KDF_COORDINATOR: 'kdf_coordinator',
};
export const ROLE_LABELS = {
  bishop: 'Bishop', admin: 'Administrator', pastor: 'Pastor',
  department_leader: 'Dept. Leader', kdf_coordinator: 'KDF Coordinator',
};
export const ROLE_COLORS = {
  bishop: '#C9A84C', admin: '#185FA5', pastor: '#2E7D32',
  department_leader: '#6A1B9A', kdf_coordinator: '#C62828',
};
export const DEPARTMENTS = [
  { id: 1,  name: 'Media',                       icon: 'Media',    color: '#185FA5' },
  { id: 2,  name: 'Choir (Faith Dynamite Voice)', icon: 'Choir',    color: '#AD1457' },
  { id: 3,  name: 'Protocol',                    icon: 'Protocol', color: '#6A1B9A' },
  { id: 4,  name: 'Affinity Group – Men',         icon: 'Men',      color: '#2E7D32' },
  { id: 5,  name: 'Affinity Group – Women',       icon: 'Women',    color: '#E65100' },
  { id: 6,  name: 'Affinity – Diplomats',         icon: 'Diplo',    color: '#00838F' },
  { id: 7,  name: 'Affinity – Teenagers',         icon: 'Teens',    color: '#F9A825' },
  { id: 8,  name: 'Prayer Department',            icon: 'Prayer',   color: '#C9A84C' },
  { id: 9,  name: 'Wisdom Training School (WTS)', icon: 'WTS',      color: '#4527A0' },
  { id: 10, name: 'Ushering Department',          icon: 'Usher',    color: '#00695C' },
  { id: 11, name: 'Staff',                        icon: 'Staff',    color: '#558B2F' },
  { id: 12, name: 'Decoration Team',              icon: 'Decor',    color: '#880E4F' },
  { id: 13, name: 'Assimilation',                 icon: 'Assim',    color: '#1565C0' },
  { id: 14, name: 'Sanctuary Keepers',            icon: 'Sanct',    color: '#A07828' },
];
export const AFFINITY_GROUPS = ['Teenagers', 'Youth', 'Men', 'Women', 'Others'];
export const MEMBER_STATUSES = ['New Convert', 'Active Member', 'Worker', 'Evangelism Contact'];
export const SPIRITUAL_STATUSES = ['Salvation', 'Water Baptized', 'Holy Spirit Baptized', 'In Discipleship', 'Matured Believer'];
export const SERVICE_TYPES = ['Sunday Service', 'Mid-Week Service', 'Prayer Night', 'Special Programme', 'Conference', 'Department Meeting'];
export const FOLLOWUP_METHODS = ['Visit', 'Phone Call', 'WhatsApp', 'Church Meeting', 'Other'];
export const FOLLOWUP_STATUSES = ['In Progress', 'Completed', 'No Response'];
export const KDF_AREAS = [
  { id: 1,  name: 'Obalende / Ikoyi / Lekki 1', coordinator: 'Pst. David Ameh', coordinatorPhone: '07033502395', assistantCoordinator: 'Bro. Uche Anyanwu', assistantPhone: '07062028620', keywords: ['obalende','ikoyi','lekki 1','lekki phase 1'] },
  { id: 2,  name: 'Oniru', coordinator: 'Elder Chris Brown', coordinatorPhone: '', assistantCoordinator: 'Rev. Favour Brown', assistantPhone: '08033800174', keywords: ['oniru'] },
  { id: 3,  name: 'Ikate / Elegushi / Chisco / Salem Alia / Safe Court', coordinator: 'Rev. Helen Ikponwonsa', coordinatorPhone: '08098180859', assistantCoordinator: 'Pst. Kingsley Okere', assistantPhone: '09139210933', keywords: ['ikate','elegushi','chisco','salem alia','safe court'] },
  { id: 4,  name: 'Itedo', coordinator: 'Bro. Tino Yakubu', coordinatorPhone: '08051629943', assistantCoordinator: '', assistantPhone: '', keywords: ['itedo'] },
  { id: 5,  name: 'Nicon Town / Victory Park / Osapa', coordinator: 'Dcns. Flora Alaka', coordinatorPhone: '08087788929', assistantCoordinator: '', assistantPhone: '', keywords: ['nicon town','nicon','victory park','osapa'] },
  { id: 6,  name: 'Ilasan', coordinator: 'Sis. Mary Zakaria', coordinatorPhone: '08168356271', assistantCoordinator: '', assistantPhone: '', keywords: ['ilasan'] },
  { id: 7,  name: 'Jakande 1st & 2nd Gate', coordinator: 'Dcn. Johnson Inebubaraye', coordinatorPhone: '08068500589', assistantCoordinator: 'Bro. Godwin Ezekiel', assistantPhone: '09138596798', keywords: ['jakande'] },
  { id: 8,  name: 'Igbara', coordinator: 'Bro. Obinna Okonkwo', coordinatorPhone: '08039170624', assistantCoordinator: '', assistantPhone: '', keywords: ['igbara'] },
  { id: 9,  name: 'Aro Town / Mayeigun / Ologolo / Femi Okunnu', coordinator: 'Sis. Angela Nnoka', coordinatorPhone: '08062518769', assistantCoordinator: 'Sis. Josephine Ignegbale', assistantPhone: '08081218331', keywords: ['aro town','aro','mayeigun','ologolo','femi okunnu'] },
  { id: 10, name: 'Igbon Efon 1', coordinator: 'Dcns. Joyce Ampadu', coordinatorPhone: '08023563933', assistantCoordinator: 'Bro. Samuel Ebiloma', assistantPhone: '07033721247', keywords: ['igbon efon 1','igbon efon1'] },
  { id: 11, name: 'Igbon Efon 2', coordinator: 'Bro. Alexander Philip', coordinatorPhone: '08063823911', assistantCoordinator: '', assistantPhone: '', keywords: ['igbon efon 2','igbon efon2'] },
  { id: 12, name: 'Agungi', coordinator: 'Sis. Tina Okere', coordinatorPhone: '09058699876', assistantCoordinator: 'Pst. Kenny Balogun', assistantPhone: '08033075538', keywords: ['agungi'] },
  { id: 13, name: 'Ajiran', coordinator: 'Sis. Pretty Kalu', coordinatorPhone: '07037142931', assistantCoordinator: 'Sis. Blessing Akpan', assistantPhone: '08106509719', keywords: ['ajiran'] },
  { id: 14, name: 'Chevy View / Chevron', coordinator: 'Sis. Margaret Eshett', coordinatorPhone: '08075438232', assistantCoordinator: 'Dr. Kioba Oruambo', assistantPhone: '08023060129', keywords: ['chevy view','chevron','chevyview'] },
  { id: 15, name: 'New Road 1', coordinator: 'Pst. Ifeanyi Okereafor', coordinatorPhone: '08066889851', assistantCoordinator: '', assistantPhone: '', keywords: ['new road 1','new road1'] },
  { id: 16, name: 'New Road 2', coordinator: 'Bro. Enobong Etteh', coordinatorPhone: '08032210551', assistantCoordinator: 'Bro. Deacon Destiny', assistantPhone: '08155592420', keywords: ['new road 2','new road2'] },
  { id: 17, name: 'Orchid / Eleganza / Oral Estate', coordinator: 'Rev. Julius Adeyeye', coordinatorPhone: '08035146941', assistantCoordinator: 'Pastor Pere Nduku', assistantPhone: '08037660347', keywords: ['orchid','eleganza','oral estate','oral'] },
  { id: 18, name: 'Victoria Garden City (VGC)', coordinator: 'Dcns. Sarah Nakuje', coordinatorPhone: '08037452542', assistantCoordinator: 'Dcns. Eunice Okoh', assistantPhone: '08034667409', keywords: ['vgc','victoria garden city','victoria garden'] },
  { id: 19, name: 'Ikota 1 & 2', coordinator: 'Dcns. Victoria Nwosu', coordinatorPhone: '08055902875', assistantCoordinator: 'Pastor Boma Anaka', assistantPhone: '08181706865', keywords: ['ikota'] },
  { id: 20, name: 'Thomas Estate', coordinator: 'Pst. Obinna Nwaogu', coordinatorPhone: '08144410898', assistantCoordinator: 'Dcn. John Ehi', assistantPhone: '08035726809', keywords: ['thomas estate','thomas'] },
  { id: 21, name: 'Mobil Road / Alaguntan / Ajah', coordinator: 'Pst. Stephen Abioye', coordinatorPhone: '08039162130', assistantCoordinator: 'Pst. Sylvia Asuquo', assistantPhone: '08034290899', keywords: ['mobil road','mobil','alaguntan','ajah'] },
  { id: 22, name: 'Badore 1', coordinator: 'Dcn. Jeff Imensili', coordinatorPhone: '08023209318', assistantCoordinator: 'Dcns. Beatrice Imensili', assistantPhone: '08035691442', keywords: ['badore 1','badore1'] },
  { id: 23, name: 'Badore 2', coordinator: 'Pst. Rowland Chukwuka', coordinatorPhone: '08052535165', assistantCoordinator: 'Sis. Glory Chukwuka', assistantPhone: '09030487634', keywords: ['badore 2','badore2'] },
  { id: 24, name: 'Ado / Langbasa', coordinator: 'Pst. Betty Benson', coordinatorPhone: '08023172491', assistantCoordinator: 'Bro. Japhet Akaan', assistantPhone: '08160566083', keywords: ['ado','langbasa'] },
  { id: 25, name: 'Abraham Adesanya / Ogombo', coordinator: 'Dcn. Joshua Negedu', coordinatorPhone: '08164070210', assistantCoordinator: 'Dcns. Olasile Odejayi', assistantPhone: '08028602034', keywords: ['abraham adesanya','adesanya','ogombo'] },
  { id: 26, name: 'Okun Ajah', coordinator: 'Rev. Zechariah Adikpenwun', coordinatorPhone: '08023922533', assistantCoordinator: 'Dcn. Uchenna Mbah', assistantPhone: '08067962758', keywords: ['okun ajah','okun'] },
  { id: 27, name: 'Olukola / Jesutedo 1', coordinator: 'Pst. John Matthew Unimi', coordinatorPhone: '08037196319', assistantCoordinator: 'Dcns. Kate Amadi', assistantPhone: '09128235747', keywords: ['olukola','jesutedo 1','jesutedo1'] },
  { id: 28, name: 'Jesutedo 2', coordinator: 'Pst. Ochuko Emetovweke', coordinatorPhone: '07012490654', assistantCoordinator: 'Pst. Odinaka Okachi', assistantPhone: '08135746256', keywords: ['jesutedo 2','jesutedo2'] },
  { id: 29, name: 'Jesutedo 3', coordinator: '', coordinatorPhone: '', assistantCoordinator: '', assistantPhone: '', keywords: ['jesutedo 3','jesutedo3'] },
  { id: 30, name: 'Crown Estate 1', coordinator: 'Dcn. Ekene Ifejokwu', coordinatorPhone: '08028381883', assistantCoordinator: '', assistantPhone: '', keywords: ['crown estate'] },
  { id: 31, name: 'Abijo', coordinator: 'Dcn. Mike Onuzurike', coordinatorPhone: '08036594465', assistantCoordinator: 'Pst. Mfon Akpan', assistantPhone: '08025665631', keywords: ['abijo'] },
  { id: 32, name: 'Lakowe 1', coordinator: 'Pst. Onochie Ifejokwu', coordinatorPhone: '08037239331', assistantCoordinator: 'Sis. Opeyemi Ifejokwu', assistantPhone: '08137884650', keywords: ['lakowe 1','lakowe1'] },
  { id: 33, name: 'Lakowe 2 (School Gate)', coordinator: 'Dcn. Michael Ochidi', coordinatorPhone: '08074738999', assistantCoordinator: 'Sis. Blessing U. Akpan', assistantPhone: '08033312014', keywords: ['lakowe 2','lakowe2','school gate'] },
  { id: 34, name: 'Ahoyaya', coordinator: 'S.D Joseph', coordinatorPhone: '07062744421', assistantCoordinator: 'Sis. Janet Isah', assistantPhone: '08054054807', keywords: ['ahoyaya'] },
  { id: 35, name: 'Ibeju Lekki', coordinator: 'Rev. Patrick Anietie', coordinatorPhone: '08026683456', assistantCoordinator: '', assistantPhone: '', keywords: ['ibeju lekki','ibeju'] },
  { id: 36, name: 'Onosa', coordinator: 'Pst. Vincent Edidem', coordinatorPhone: '08030585238', assistantCoordinator: 'Dcn. Meshach Nuhu', assistantPhone: '07039434906', keywords: ['onosa'] },
  { id: 37, name: 'Eleko', coordinator: 'Sis. Comfort Joseph', coordinatorPhone: '08154379912', assistantCoordinator: '', assistantPhone: '', keywords: ['eleko'] },
  { id: 38, name: 'Eputu / Ogunfayo 1', coordinator: 'Rev. John Nnekwe', coordinatorPhone: '08037202494', assistantCoordinator: 'Sis. Helen Isamo', assistantPhone: '08023301683', keywords: ['eputu','ogunfayo 1','ogunfayo1'] },
  { id: 39, name: 'Eputu / Ogunfayo 2', coordinator: 'Pst. John Ifejokwu', coordinatorPhone: '08033401571', assistantCoordinator: 'Bro. Clement Stephen', assistantPhone: '08029443072', keywords: ['ogunfayo 2','ogunfayo2'] },
  { id: 40, name: 'Ikorodu', coordinator: 'Bro. Muyiwa Ogunnusi', coordinatorPhone: '08134096599', assistantCoordinator: 'Bro. Messe Femi', assistantPhone: '08081008816', keywords: ['ikorodu'] },
  { id: 41, name: 'Gbagada / Bariga', coordinator: 'Pst. Howard Odigie', coordinatorPhone: '08184652203', assistantCoordinator: '', assistantPhone: '', keywords: ['gbagada','bariga'] },
];
export function matchKDFArea(address) {
  if (!address) return null;
  const lower = address.toLowerCase();
  for (const area of KDF_AREAS) {
    for (const kw of area.keywords) {
      if (lower.includes(kw)) return area;
    }
  }
  return null;
}
export function getTodaysBirthdays(members) {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return members.filter(m => {
    if (!m.date_of_birth) return false;
    return m.date_of_birth.slice(5, 7) === mm && m.date_of_birth.slice(8, 10) === dd;
  });
}
