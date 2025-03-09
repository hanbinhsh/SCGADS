// src/langurage/zh.js 
// 定义中文语言包对象
const zh =  {
  Cancel: '取消',
  Save: '保存',
  Avatar: '头像',
  UserName: '用户名',
  Password: '密码',
  Email: '电子邮件',
  Phone: '电话号码',
  Enternewpassword: '请输入新密码',
  Operations: '操作',

  database: {
    models: {
      model_id: "模型ID",
      model_name: "模型名称",
      model_type: "模型类型",
      model_path: "模型存储路径",
      predict_file_path: "预测文件存储路径",
      train_file_path: "训练文件存储路径",
      figure_path: "模型图存储路径",
      default_parameters: "默认参数"
    },
    user: {
      user_id: "用户ID",
      user_name: "用户",
      psw: "用户密码",
      email: "电子邮件",
      is_admin: "是否是管理员",
      phone: "电话号码",
      avatar: "用户头像"
    },
    task: {
      task_id: "任务ID",
      task_name: "任务名",
      start_time: "开始时间",
      end_time: "结束时间",
      status: "状态",
      details: "详情",
      uploader_id: "上传者ID",
      type: "任务类型",
      parameters: "任务参数",
      model: "模型",
      model_id: "模型ID"
    },
    files: {
      file_id: "文件ID",
      scRNA_seq_file: "scRNA-seq文件名",
      scATAC_seq_file: "scATAC-seq文件名",
      Tag_file: "Tag文件名",
      task_name: "任务名"
    },
    feedback: {
      feedback_id: "反馈ID",
      user_id: "用户ID",
      subject: "主题",
      message: "信息",
      created_time: "反馈时间"
    },
    result: {
      result_id: "文件的唯一标识符",
      config_file: "config.js文件",
      data_file: "data.js文件",
      lable_file: "lable.js文件",
      task_name: "对应任务"
    },
    fileHashReference: {
      hash: "文件哈希值",
      file_name: "文件名",
      reference_count: "引用计数"
    }
  },
  navigateBar: {
    Login: '登录',
    Register: '注册',
    Profile: '个人主页',
    Logout: '登出',

    HomeView: '主页',

    Manage: '管理',
    ManageUsers: '用户管理',
    ManageTasks: '任务管理',
    ManageFeedbacks: '反馈管理',
    ManageModel: '模型管理',
    SystemSettings: '系统设置',
    
    Applications: '应用',
    WorkSpace: '仪表盘',
    Upload: '上传任务',
    Virtualization: '数据可视化',
    Feedback: '反馈',
  },
  homeView: {
    title: 'SCGADS: 面向单细胞数据的智能化基因组解析与可视化平台',
    p21title: '什么是单细胞类型注释?',
    p21text: '单细胞类型注释是生物信息学中的一个关键过程，旨在对异质性细胞群中的不同细胞类型进行分类和识别。\
              该过程对于解析组织、器官乃至整个生物体的复杂细胞组成至关重要。\
              随着高通量单细胞测序技术的兴起，研究人员如今能够解析成千上万乃至数百万个细胞的转录组和表观基因组特征，从而深入揭示细胞多样性、分化路径及疾病机制。',
    p22title: '什么是scRNA-seq?',
    p22text: '单细胞RNA测序（scRNA-seq）是一种强大的技术，可用于测量单个细胞的基因表达水平。\
              通过捕获并测序单细胞的信使RNA（mRNA），scRNA-seq能够构建详尽的细胞图谱，揭示不同细胞类型的身份及其状态。\
              这一技术彻底革新了我们对细胞分化、发育及疾病分子机制的认知。scRNA-seq不仅有助于发现新型细胞类型，还能解析细胞间的异质性，并表征那些在整体RNA测序方法中可能被掩盖的稀有或瞬时细胞群。',
    p23title: '什么是scATAC-seq?',
    p23text: '单细胞转座酶可及染色质测序（scATAC-seq）是一种用于解析单细胞表观遗传景观的技术，通过绘制开放染色质区域图谱来揭示染色质可及性。\
              与专注于基因表达的 scRNA-seq 不同，scATAC-seq 提供了DNA潜在调控区域（如增强子和启动子）的可及性信息。\
              通过解析基因组中哪些区域是开放的，scATAC-seq 能够揭示控制基因表达的调控机制，为细胞类型特异性功能、基因调控网络以及发育或疾病进程中染色质状态的动态变化提供深刻见解。',
    p31title: '整合 scRNA-seq 和 scATAC-seq 进行细胞类型注释',
    p31text: '通过整合 scRNA-seq 和 scATAC-seq 数据，研究人员可以更全面地解析细胞身份。\
              scRNA-seq 提供了细胞转录状态的详细信息，而 scATAC-seq 则揭示了决定这些转录程序的调控元件。\
              结合两种技术，不仅能够更准确地注释细胞类型和状态，还可以解析细胞层级关系，并识别驱动细胞命运决定的关键调控机制。',
    p32text: '同时利用转录组和表观基因组数据进行单细胞类型注释，对于深化生物学理解、开发新型治疗策略以及基于个体细胞组成进行精准医疗至关重要。',
    p33text: '细胞类型注释是后续生物医学研究的重要基础。近年来，基于深度学习的监督分类方法在细胞类型注释方面取得了显著进展。\
              然而，如何高效利用单细胞多组学数据进行细胞类型注释和解析，以及如何赋予模型自适应泛化能力以高效识别稀有细胞类型，仍然是亟待解决的挑战。',
    p34text: '我们提出了 scMoAnno，一种基于单细胞多组学数据的细胞类型注释方法。该方法利用 预训练的跨注意力（cross-attention）网络，实现单细胞多组学数据中遗传与表观遗传特征的高效互学习与融合，从而实现精准的细胞类型注释。\
              在 scRNA-seq 和 scATAC-seq 数据上的预测结果表明，scMoAnno 通过 预训练特征融合提取 并基于融合数据训练分类器，展现出卓越的泛化能力，特别是在 稀有细胞类型识别 方面表现突出。',
    p35text: '在 四个经过严格筛选的基准数据集 上进行的实验表明，scMoAnno 在整体性能上超越了 九种最先进的基准模型。此外，scMoAnno 通过多组学数据融合提高了聚类评分，并在单细胞数据的下游分析中展现了显著优势，进一步证明了本模型在细胞类型注释中的增强能力如何促进生物医学研究的深入发展。',
  
    p41title: 'scMoAnno 工作流程图',
    p411text: 'scMoAnno 模型采用双轮监督学习以提高细胞类型注释的准确性。\
              第一轮学习：利用预训练的融合特征提取器，对 scRNA-seq 和 scATAC-seq 数据进行 跨注意力（cross-attention）特征提取，编码两种模态之间的交互特征。',
    p412text: '第二轮学习：基于预训练特征提取器生成的融合数据，引入基于 Transformer 的细胞类型注释模块，实现高精度的细胞类型分配。',
    p42title: '对比分析结果',
    p42text: '实验结果表明，scMoAnno 方法在准确率等指标上 优于基准对比方法。\
              与表现最优的基准方法 CIForm 相比，scMoAnno 在 准确率 方面提升 2%。\
              在 平衡准确率（balanced accuracy） 指标上，scMoAnno 达到了 90%，与基准方法 scTransSort 持平。\
              这一结果验证了 scMoAnno 方法的可行性与有效性，进一步证明了其在细胞类型注释任务中的卓越性能。',
  },
  profile: {
    EditInformation: '编辑个人信息',
  },
}

export default zh;