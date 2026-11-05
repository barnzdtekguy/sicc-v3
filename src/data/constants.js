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
  { id: 1, name: 'Missions', icon: 'Missions', color: '#185FA5', heads: [], teams: [
    { name: 'Peter Generation', heads: ['Rev. Julius Adeyeye'] },
    { name: 'Paul Generation', heads: ['Rev. Julius Adeyeye'] },
    { name: 'David Generation', heads: ['Pst. Archibong Inyang'] },
    { name: 'OPRAC / Prisons / Hospital Ministry', heads: ['Pastor John Harrison'] },
  ] },
  { id: 2, name: 'Prayer', icon: 'Prayer', color: '#AD1457', heads: ['Pastor Simeon Ochelle', 'Pst. Kingsley Okere'] },
  { id: 3, name: 'KDF', icon: 'KDF', color: '#6A1B9A', heads: ['Rev. Raphael Ikediuwa', 'Pst. Kingsley Okere'] },
  { id: 4, name: 'Training', icon: 'Training', color: '#2E7D32', heads: ['Rev. Zech Adikpewun'] },
  { id: 5, name: 'Assimilation / Covenant Friends', icon: 'Assimilation / Covenant Friends', color: '#E65100', heads: ['Rev. John Nnekwe', 'Dcns. Janet Ajebote'] },
  { id: 6, name: 'Transport', icon: 'Transport', color: '#00838F', heads: ['Pastor Dozie Emenyi', 'Dcn. Mike Onuzurike', 'Pst. Stephen Abioye'] },
  { id: 7, name: 'Wealth Creation / Cooperative', icon: 'Wealth Creation / Cooperative', color: '#F9A825', heads: ['Sister Oluyemisi Balogun', 'Pst. Pere Nduku', 'Susan Eshett'] },
  { id: 8, name: 'Faith Dynamite Voice', icon: 'Faith Dynamite Voice', color: '#C9A84C', heads: ['Rev. Austin Olugbemi', 'Pastor Ochuko Emewevtoke', 'Pst. Mfon Akpan'], teams: [
    { name: 'Teenage / Children’s FDV Coordinator', heads: ['Pst. Odinaka', 'Brother Samuel Ebiloma'] },
  ] },
  { id: 9, name: 'Decoration', icon: 'Decoration', color: '#4527A0', heads: ['Dr. Kioba Oruambo', 'Rev. Helen Ikponwosa', 'Rev. Favour Brown', 'Sis. Tina Okere'] },
  { id: 10, name: 'Media', icon: 'Media', color: '#00695C', heads: ['Sister Susan Eshett', 'Pastor Ikenna Nwosu', 'Engr. Victor Obomanu'] },
  { id: 11, name: 'Facility Management / Projects', icon: 'Facility Management / Projects', color: '#558B2F', heads: ['Rev. Engr. Eremosele', 'Pst. Obinna Nwaogu', 'Dcn. Mike Onuzurike', 'Engr. Victor Obomanu', 'Pst. Kingsley Okere', 'Pastor Ochuko Emetovweke', 'Bro. Muyiwa Ogunnusi'] },
  { id: 12, name: 'Security', icon: 'Security', color: '#880E4F', heads: ['Pst. Felicia Idiakheua', 'Bro. Paulinus Ekpu'] },
  { id: 13, name: 'Welfare', icon: 'Welfare', color: '#1565C0', heads: ['Pst. Kenny Balogun'] },
  { id: 14, name: 'Finance', icon: 'Finance', color: '#A07828', heads: ['Rev. John Nnekwe', 'Pst. John Unimi', 'Dcn. John Ehi', 'Pst. Stephen Abioye'] },
  { id: 15, name: 'Medical', icon: 'Medical', color: '#185FA5', heads: ['Rev. Austin Olugbemi', 'Dcns. Joy Ampadu'] },
  { id: 16, name: 'Education / Scholarship', icon: 'Education / Scholarship', color: '#AD1457', heads: ['Pst. Betty Benson', 'Pst. Dr. Kioba Oruambo', 'Hon. OkeyJoe Onuakalusi'] },
  { id: 17, name: 'Baptism Ministry', icon: 'Baptism Ministry', color: '#6A1B9A', heads: ['Pst. Archibong Inyang', 'Pst. Simeon Ochelle', 'Pst. Harrison John'] },
  { id: 18, name: 'Legal Council', icon: 'Legal Council', color: '#2E7D32', heads: ['Rev. Helen Ikponwosa', 'Barr. Pere Nduku'] },
  { id: 19, name: 'Bookshop / Reading Culture', icon: 'Bookshop / Reading Culture', color: '#E65100', heads: ['Pst. Ikenna Nwosu', 'Dcn. Sokeipiriala'] },
  { id: 20, name: 'Healing & Deliverance Crack Team', icon: 'Healing & Deliverance Crack Team', color: '#00838F', heads: ['Pst. Harrison John', 'Rev. Helen Ikponmwosa', 'Rev. Patrick Anietie', 'Pst. Archibong Inyang', 'Pastor Simeon Ochelle', 'Dcns. Sarah Nakuje', 'Pst. Nelson Ugochukwu'] },
  { id: 21, name: 'Counselling / Call Centre', icon: 'Counselling / Call Centre', color: '#F9A825', heads: ['Rev. Patrick Edet', 'Pst. Nelson Ugochukwu'] },
  { id: 22, name: 'Marriage / Couples', icon: 'Marriage / Couples', color: '#C9A84C', heads: ['Dcns. Elizabeth Law', 'Rev. Zech Adikpewun'] },
  { id: 23, name: 'Singles Connect', icon: 'Singles Connect', color: '#4527A0', heads: ['Bro. Enobong Etteh', 'Sis. Bose Kuye'] },
  { id: 24, name: 'Ushering', icon: 'Ushering', color: '#00695C', heads: ['Pst. Howard Odigie', 'Dcn. Law Sokeipiriala', 'Pastor Sylvia Asuquo'] },
  { id: 25, name: 'Visitation', icon: 'Visitation', color: '#558B2F', heads: [] },
  { id: 26, name: 'Publicity / Branding', icon: 'Publicity / Branding', color: '#880E4F', heads: ['Rev. Raphael Ikediuwa'] },
  { id: 27, name: 'Salem Elders Ministry', icon: 'Salem Elders Ministry', color: '#1565C0', heads: ['Pastor John Ifejokwu', 'Pst. Betty Benson'] },
  { id: 28, name: 'Communion', icon: 'Communion', color: '#A07828', heads: ['Pastor Janet Adikpewun', 'Dcns. Esther Abioye', 'Sis. Tina Okere'] },
  { id: 29, name: 'Sanctuary Keepers', icon: 'Sanctuary Keepers', color: '#185FA5', heads: ['Dcns. Deborah Ebiloma', 'Bro. Mindia Chiwar', 'Sis. Margaret Eshett'] },
  { id: 30, name: 'Affinity Leadership', icon: 'Affinity Leadership', color: '#AD1457', heads: [], teams: [
    { name: 'Women', heads: ['Rev. Catherine Etteh', 'Pst. Felicia Idiakheua'] },
    { name: 'Men', heads: ['Pst. Obinna Nwaogu', 'Pst. Eremosele Asibor'] },
    { name: 'Diplomats', heads: ['Dcn. Uchenne Mbah (Head)', 'Dcns. Ekene Ifejokwu (Assistant 1)', 'Bro. Freedom Immonah (Campus Fellowship Coordinator, Assistant 2)'] },
    { name: 'Teenage', heads: ['Dcns. Kate Amadi', 'Pst. Odinaka Okachi'] },
    { name: 'Children', heads: ['Pst. Timi Nduku', 'Dcns. Eunice Okoh'] },
  ] },
  { id: 31, name: 'Announcement', icon: 'Announcement', color: '#6A1B9A', heads: ['Dcns. Victoria Nwosu', 'Dcns. Sarah Nakuje'] },
  { id: 32, name: 'Salem Theatre', icon: 'Salem Theatre', color: '#2E7D32', heads: ['Sis. Janet Jiya', 'Sis. Bose Kuye'] },
  { id: 33, name: 'Dedication', icon: 'Dedication', color: '#E65100', heads: ['Pst. Ijeoma Ikediuwa', 'Pst. Janet Adikpewun'] },
  { id: 34, name: 'Protocol', icon: 'Protocol', color: '#00838F', heads: ['Pst. Pere Nduku', 'Dcns. Kate Amadi', 'Hon. OkeyJoe Onuakalusi'] },
  { id: 35, name: 'Conflict Resolution Team', icon: 'Conflict Resolution Team', color: '#F9A825', heads: ['Rev. Helen Ikpomnwosa'] },
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
