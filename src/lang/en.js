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
  Download: 'Download',
  Detail: 'Detail',
  Edit: 'Edit',
  Delete: 'Delete',
  Refresh: 'Refresh',
  BatchDelete: 'Batch Delete',
  Notcompletedyet: 'Not completed yet',
  Confirm: 'Confirm',
  Reset: 'Reset',
  Create: 'CreateCompany',
  Add: 'Add',
  Close: "Close",

  modelPage:{
    SingleModality: "Single",
    MultiModality: "Multi",
    Denoising: "Denoising",
    MyModels: "My Models",
    Models: "Models",
    ModelImage: "Model Image",
    View: "View",
    SingleModalityModels: "Single Modality Models",
    MultiModalityModels: "Multi Modality Models",
    DenoisingModels: "Denoising Models",
    NoModelsFound: "No Models Found",
    UploadModel: "Upload Model",
    Details: "Details",
    ModelType: "ModelType",
    DefaultParameters: "Parameters",
    Remark: "Remark",
    Image: "Image",
    SearchModels: "Search Models",
    Edit: "Edit",
    Pretrain: "Pretrain",
  },
  SystemSettings:{
    tip: "Set Auto Progress OFF if you have not put models online.",
    AutoProgress: "Auto Progress",
    EncryptFiles:"Encrypt Files",
  },
  ModelManage: {
    Figure: "Figure",
    Parameters: "Parameters",
    AddModel: "Add Model"
  },
  feedback: {
    sendfeedback: "Feedback",
    history: "History",
    feedback: "Feedback",
    feedbacktip: "You can submit your feedback below, and we will get your message.",
    Subject: "Subject",
    Message: "Message",
    SendMessage: "Send Message",
    Date: "Date",
    Responsestofeedback: "Responses to feedback",
    Noreply: "No Reply",
    View: "View",
    AdminReply: "Reply",
  },
  Visualization: {
    Denoising: "Denoising",
    Example: "Example",
    DataVisualization: "Data Visualization",
    Switch: "Switch",
    True: "True",
    Pred: "Pred",
    Label: "Label",
    Position: "Position",
    Settings: "Settings",
    DownloadData: "Download Data",
    DownloadCharts: "Download Charts",
    DownloadReport: "Download Report",
    AxisSettings: "Axis Settings",
    ChartMagnifyRatio: "Chart Magnify Ratio",
    ShowAxis: "Show Axis",
    ShowTicks: "Show Ticks",
    ShowAxisLine: "Show Axis Line",
    ShowLabels: "Show Labels",
    ShowGridLines: "Show Grid Lines",
    Task: "Task",
    failLoad: "result failed to load, please contract to administrator.",
    PretrainResult: 'Pretrain Result',
    TrainResult: 'Train Result', 
    TrainLoss: 'Train Loss',
    ValidationLoss: 'Validation Loss',
    TrainAccuracy: 'Train Accuracy',
    TrainF1: 'Train F1',
    ValidationAccuracy: 'Validation Accuracy',
    ValidationF1: 'Validation F1',
    TrainResultLoadFailed: 'Train ResultLoad Failed',
    Close: 'Close',
    Loss: 'Loss',
    AccuracyF1: 'Accuracy & F1',
  },
  uploadPage: {
    Annotation: "Annotation",
    Training: "Training",
    Denoising: "Denoising",
    Dropfilehereor: "Drop file here or ",
    clicktoupload: "click to up load",
    Upload: "Upload",
    file: "file",
    Tag: "Tag",
    Tutorial: "Tutorial",
    annoAlart: "Do not change the parameters if you are using built-in models.",
    ModelSelect: "Model Select",
    Model: "Model",
    UploadFile: "Upload File",
    InputParameters: "Input Parameters",
    Results: "Results",
    Selectmodelhere: "Select model here.",
    Checkthemodelfigure: "Check the model figure.",
    Putyourfileshere: "Put your files here.",
    Inputparametersifnecessary: "Input parameters if necessary.",
    Clicktoupload: "Click to upload.",
    Resultswillbeshownhere: "Results will be shown here.",
    RePretrain: "Re-Pretrain",
  },
  status: {
    Pending: "Pending",
    Processing: "Processing",
    Completed: "Completed",
    Error: "Error",
    Unknown: "Unknown",
  },
  taskType: {
    Singleomic: "Single-omic",
    Multiomics: "Multi-omics",
    Denoising: "Denoising",
    Unknown: "Unknown",
    Annotation: "Annotation",
    Training: "Training",
  },
  workSpace: {
    TaskStatus: "Task Status",
    MyShares: "My Shares",
    ShareReceived: "Share Received",
    Expand: "Expand",
    Collapse: "Collapse",
    Expire: "Expire",
    Expired: "Expired",
    Indefinite: "Indefinite",
    CopyLink: 'Copy Link',
    MyModels: "My Models",
    Nomodelsfound: "No models found",
    Norecentreceivedsharesfound: "No recent received shares found",
    Norecentsharesfound: "No recent shares found",
    Norecentcompletedtaskfound: "No recent completed task found",
    Created: "Created",
    ShareTask: "Share Task",
    Expiration: "Expiration",
    Days: "Days",
    Hours: "Hours",
    Minutes: "Minutes",
    Recipient: "Recipient",
    RecipientPlaceholder: "Username (empty for all users)",
    Company: "Company",
    CompanyPlaceholder: "Company name (empty for all companies)",
    Password: "Password",
    PasswordPlaceholder: "Set access password (optional)",
    PasswordHint: "If set, recipients need to enter password to access",
    HoursRange: "Hours must be between 0-23",
    MinutesRange: "Minutes must be between 0-59",
    DaysPositive: "Days cannot be negative",
    CannotShareToSelf: "Cannot share to yourself",
    UserNotExist: "User does not exist",
    CompanyNotExist: "Company does not exist",
    ShareSuccess: "Share successful",
    ShareFailed: "Share failed",
    Cancel: "Cancel",
    Confirm: "Confirm"
  },
  taskManage: {
    Auto: "Auto",
    BatchDownload: "Batch Download",
    BatchEdit: 'Batch Edit',
  },
  database: {
    models: {
      model_id: "Model ID",
      model_name: "Model Name",
      model_type: "Model Type",
      model_path: "Model Storage Path",
      predict_file_path: "Prediction File Storage Path",
      train_file_path: "Training File Storage Path",
      figure_path: "Model Image Storage Path",
      default_parameters: "Default Parameters",
      remark: "Remark",
      extract_labels: "Extract Labels",
      user_name: "Uploader name",
      company_name: "Company Name",
      created_time: "Upload Time",
      pretrain_model: "Pretrain Model",
      base_model: "Base Model",
    },
    user: {
      user_id: "User ID",
      user_name: "Username",
      psw: "User Password",
      email: "Email",
      is_admin: "Is Admin",
      phone: "Phone Number",
      avatar: "User Avatar",
      is_verified: "Is Verified"
    },
    company: {
      company_id: "Company ID",
      company_name: "Company Name",
    },
    log:{
      action: "Action",
      importance: "Importance",
      timestamp: "Log time",
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
      model_id: "Model ID",
      re_pretrain: "Re-Pretrain",
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
      created_time: "Feedback Time",
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
    ManageLogs: 'Log Management',
    Manage: 'Manage',
    ManageUsers: 'User Management',
    ManageCompanys: 'Company Management',
    ManageTasks: 'Task Management',
    ManageFeedbacks: 'Feedback Management',
    ManageModel: 'Model Management',
    SystemSettings: 'System Settings',
    
    Applications: 'Applications',
    WorkSpace: 'Work Space',
    ModelMarket: "Model Market",
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
    p34text: 'We introduce scLTH, a methodology for cell type annotation based on single-cell multi-omics data.\
              Leveraging pre-trained cross-attention networks, scLTH facilitates efficient mutual learning and fusion\
              of genetic and epigenetic distributions in single-cell multi-omics data, enabling precise cell type\
              annotation. Predictions conducted by scLTH on single-cell RNA sequencing (scRNA-seq) and single-cell\
              assay for transposase-accessible chromatin sequencing (scATAC-seq) data demonstrate enhanced\
              generalization capacity for the recognition of rare cell types through pre-trained feature fusion\
              extraction and training of classifiers based on fused data inputs.',
    p35text: 'Rigorously conducted experiments on four meticulously curated benchmark datasets illustrate that scLTH\
              surpasses 4 other state-of-the-art baseline models in overall performance. Furthermore, the increase in\
              clustering scores, fused with multi-omics data and extracted by scLTH, is elucidated from the\
              perspective of promoting downstream analysis of single cells, explaining how our model\'s enhancement of\
              cell type annotation performance yields positive effects.',

              
    p41title: 'The workflow of scLTH',
    p411text: 'The SCLTH model adopts a cross-modality latent space alignment strategy to enhance the accuracy of multimodal single-cell type annotation.\
              Phase 1: A KL-divergence-based alignment mechanism is introduced to map the latent representations of scRNA-seq and scATAC-seq into a shared space, enabling better modeling of cross-omics correlations.',
    p412text: 'Phase 2: A multi-head attention-based annotation module is constructed to effectively capture informative features from the fused representation, achieving accurate cell type classification.',
    p42title: 'Comparative analysis results',
    p42text: 'Experimental results demonstrate that SCLTH consistently outperforms existing methods in terms of Accuracy and F1-score across three public multimodal datasets (10X-Multiome, SHARE-seq, and ASAP-seq).\
              Compared to gene marker-based methods like Seurat and supervised models such as CIForm and scTransSort, SCLTH achieves superior performance. For instance, on the 10X-Multiome dataset, SCLTH reached an average Accuracy of 96.9% and an F1-score of 95.4%, ranking first among all evaluated methods.\
              These results verify the effectiveness and robustness of the proposed method for multimodal cell type annotation.',
  },
  profile: {
    EditInformation: 'Edit Information',
  },
}
export default en;