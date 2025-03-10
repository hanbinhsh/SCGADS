// src/langurage/en.js 
// 定义英文语言包对象
const en = {
  Cancel: 'Cancel',
  Save: 'Save',
  Avatar: 'Avatar',
  UserName: 'User Name',
  Password: 'Password',
  Email: 'Email',
  Phone: 'Phone',
  Enternewpassword: 'Enter new password',
  Operations: 'Operations',

  database: {
    models: {
      model_id: "Model ID",
      model_name: "Model Name",
      model_type: "Model Type",
      model_path: "Model Storage Path",
      predict_file_path: "Prediction File Storage Path",
      train_file_path: "Training File Storage Path",
      figure_path: "Model Image Storage Path",
      default_parameters: "Default Parameters"
    },
    user: {
      user_id: "User ID",
      user_name: "Username",
      psw: "User Password",
      email: "Email",
      is_admin: "Is Admin",
      phone: "Phone Number",
      avatar: "User Avatar"
    },
    task: {
      task_id: "Task ID",
      task_name: "Task Name",
      start_time: "Start Time",
      end_time: "End Time",
      status: "Status",
      details: "Details",
      uploader_id: "Uploader ID",
      type: "Task Type",
      parameters: "Task Parameters",
      model: "Model",
      model_id: "Model ID"
    },
    files: {
      file_id: "File ID",
      scRNA_seq_file: "scRNA-seq File Name",
      scATAC_seq_file: "scATAC-seq File Name",
      Tag_file: "Tag File Name",
      task_name: "Task Name"
    },
    feedback: {
      feedback_id: "Feedback ID",
      user_id: "User ID",
      subject: "Feedback Subject",
      message: "Feedback Message",
      created_time: "Feedback Time"
    },
    result: {
      result_id: "Unique Identifier of File",
      config_file: "config.js File",
      data_file: "data.js File",
      lable_file: "lable.js File",
      task_name: "Corresponding Task"
    },
    fileHashReference: {
      hash: "File Hash",
      file_name: "File Name",
      reference_count: "Reference Count"
    }
  },
  navigateBar: {
    Login: 'Login',
    Register: 'Register',
    Profile: 'Profile',
    Logout: 'Log out',

    HomeView: 'Home View',

    Manage: 'Manage',
    ManageUsers: 'User Management',
    ManageTasks: 'Task Management',
    ManageFeedbacks: 'Feedback Management',
    ManageModel: 'Model Management',
    SystemSettings: 'System Settings',
    
    Applications: 'Applications',
    WorkSpace: 'Work Space',
    Upload: 'Upload',
    Virtualization: 'Virtualization',
    Feedback: 'Feedback',
  },
  homeView: {
    title: 'SCGADS: Smart Computing Genomic Analysis & Display System for Single-cell Data',
    p21title: 'Introduction to Single-Cell Type Annotation',
    p21text: 'Single-cell type annotation is a process in bioinformatics used to classify and identify different cell\
              types within a heterogeneous population at the single-cell level. This is crucial in understanding the\
              complex cellular composition of tissues, organs, and entire organisms. With the advent of high-throughput\
              single-cell sequencing technologies, researchers can now examine the transcriptomic and epigenomic\
              profiles of thousands to millions of cells, gaining deeper insights into cellular diversity,\
              differentiation pathways, and disease mechanisms.',
    p22title: 'What is scRNA-seq?',
    p22text: 'Single-cell RNA sequencing (scRNA-seq) is a powerful technique used to measure the gene expression levels\
              of individual cells. By capturing and sequencing the messenger RNA (mRNA) from single cells, scRNA-seq\
              enables the construction of comprehensive cellular maps, revealing the identities and states of distinct\
              cell types. This technology has revolutionized our understanding of cell differentiation, development, and\
              the molecular basis of diseases. scRNA-seq helps in discovering new cell types, understanding cell-to-cell\
              heterogeneity, and characterizing rare or transient cell populations that might be masked in bulk RNA\
              sequencing approaches.',
    p23title: 'What is scATAC-seq?',
    p23text: 'Single-cell Assay for Transposase-Accessible Chromatin using sequencing (scATAC-seq) is a technique used\
              to analyze the epigenetic landscape of individual cells by mapping open chromatin regions. Unlike\
              scRNA-seq, which focuses on gene expression, scATAC-seq provides information about the accessibility of\
              DNA regions that are potentially regulatory, such as enhancers and promoters. By understanding which\
              regions of the genome are accessible, scATAC-seq helps to elucidate the regulatory mechanisms that control\
              gene expression, providing insights into cell type-specific functions, gene regulatory networks, and the\
              dynamic changes in chromatin states during development or disease progression.',
    
    p31title: 'Integrating scRNA-seq and scATAC-seq for Cell Type Annotation',
    p31text: 'By integrating data from scRNA-seq and scATAC-seq, researchers can achieve a more comprehensive view of\
              cellular identity. scRNA-seq provides detailed insights into the transcriptional state of cells, while\
              scATAC-seq sheds light on the regulatory elements that shape these transcriptional programs. Together,\
              these technologies allow for more accurate annotation of cell types and states, understanding of cellular\
              hierarchies, and identification of key regulatory mechanisms driving cell fate decisions.',
    p32text: 'Single-cell type annotation, using both transcriptomic and epigenomic data, is crucial for\
              advancing our understanding of biology, developing new therapeutic strategies, and personalizing medicine\
              based on the cellular makeup of individual patients.',
    p33text: 'Cell type annotation is paramount for subsequent biomedical research endeavors. Recently, supervised\
              classification methods based on deep learning have demonstrated significant advancements in cell type\
              annotation. However, challenges persist regarding how to efficiently leverage single-cell multi omics data\
              for cell type annotation and interpretation and how to endow models with adaptive generalization\
              capabilities for efficient identification of rare cell types.',
    p34text: 'We introduce scMoAnno, a methodology for cell type annotation based on single-cell multi-omics data.\
              Leveraging pre-trained cross-attention networks, scMoAnno facilitates efficient mutual learning and fusion\
              of genetic and epigenetic distributions in single-cell multi-omics data, enabling precise cell type\
              annotation. Predictions conducted by scMoAnno on single-cell RNA sequencing (scRNA-seq) and single-cell\
              assay for transposase-accessible chromatin sequencing (scATAC-seq) data demonstrate enhanced\
              generalization capacity for the recognition of rare cell types through pre-trained feature fusion\
              extraction and training of classifiers based on fused data inputs.',
    p35text: 'Rigorously conducted experiments on four meticulously curated benchmark datasets illustrate that scMoAnno\
              surpasses nine other state-of-the-art baseline models in overall performance. Furthermore, the increase in\
              clustering scores, fused with multi-omics data and extracted by scMoAnno, is elucidated from the\
              perspective of promoting downstream analysis of single cells, explaining how our model\'s enhancement of\
              cell type annotation performance yields positive effects.',
    p41title: 'The workflow diagram of scMoAnno',
    p411text: 'The scMoAnno model undergoes two rounds of supervised learning. In the first round, a pre-trained fusion\
              feature extractor is utilized to perform cross-attention feature extraction on scRNA-seq and scATAC-seq\
              data, encoding the interaction features of the two modalities.',
    p412text: 'In the second round, using the feature data generated by the pre-trained feature extractor, a\
              Transformer-based fusion data cell type annotation module is introduced to achieve the precise assignment\
              of cell types.',
    p42title: 'Comparative analysis results',
    p42text: 'In Table, the scMoAnno method outperformed the baseline comparison methods regarding accuracy\
              metrics. Compared to the best-performing baseline method CIForm in terms of accuracy, the scMoAnno method\
              achieved a 2% improvement in accuracy. In terms of balanced accuracy metrics, it reached a balanced\
              accuracy of 90%, which was on par with the best-performing baseline method, scTransSort. Thus, this\
              validates the feasibility and effectiveness of the proposed method in this study.',
  },
  profile: {
    EditInformation: 'Edit Information',
  },
}
export default en;