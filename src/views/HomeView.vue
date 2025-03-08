<template>
  <div class="main-page">
    <MainHeader></MainHeader>
    <div>
      <!-- Hero Section -->
      <section class="fullscreen-mainpage-section" style="position: relative;">
        <div class="background-images">
          <img src="@/assets/background/1.png" alt="background element" class="rotating-image bg-img-1" />
          <img src="@/assets/background/2.png" alt="background element" class="rotating-image bg-img-2" />
          <img src="@/assets/background/3.png" alt="background element" class="rotating-image bg-img-3" />
          <img src="@/assets/background/4.png" alt="background element" class="rotating-image bg-img-4" />
          <img src="@/assets/background/5.png" alt="background element" class="rotating-image bg-img-5" />
        </div>
        <div class="hero-content">
          <div class="logo-container">
            <img src="@/assets/logo.png" alt="Logo" class="logo" />
          </div>
          <h1 class="hero-title">SCGADS: Smart Computing Genomic Analysis & Display System for Single-cell Data</h1>
          <div class="scroll-indicator">
            <el-icon>
              <ArrowDownBold />
            </el-icon>
          </div>
        </div>
      </section>

      <!-- Introduction Section -->
      <section class="content-section">
        <div class="section-container">
          <div class="content-text">
            <h2 class="section-title">Introduction to Single-Cell Type Annotation</h2>
            <p>
              Single-cell type annotation is a process in bioinformatics used to classify and identify different cell
              types within a heterogeneous population at the single-cell level. This is crucial in understanding the
              complex cellular composition of tissues, organs, and entire organisms. With the advent of high-throughput
              single-cell sequencing technologies, researchers can now examine the transcriptomic and epigenomic
              profiles of thousands to millions of cells, gaining deeper insights into cellular diversity,
              differentiation pathways, and disease mechanisms.
            </p>
            <h2 class="section-title">What is scRNA-seq?</h2>
            <p>
              Single-cell RNA sequencing (scRNA-seq) is a powerful technique used to measure the gene expression levels
              of individual cells. By capturing and sequencing the messenger RNA (mRNA) from single cells, scRNA-seq
              enables the construction of comprehensive cellular maps, revealing the identities and states of distinct
              cell types. This technology has revolutionized our understanding of cell differentiation, development, and
              the molecular basis of diseases. scRNA-seq helps in discovering new cell types, understanding cell-to-cell
              heterogeneity, and characterizing rare or transient cell populations that might be masked in bulk RNA
              sequencing approaches.
            </p>
            <h2 class="section-title">What is scATAC-seq?</h2>
            <p>
              Single-cell Assay for Transposase-Accessible Chromatin using sequencing (scATAC-seq) is a technique used
              to analyze the epigenetic landscape of individual cells by mapping open chromatin regions. Unlike
              scRNA-seq, which focuses on gene expression, scATAC-seq provides information about the accessibility of
              DNA regions that are potentially regulatory, such as enhancers and promoters. By understanding which
              regions of the genome are accessible, scATAC-seq helps to elucidate the regulatory mechanisms that control
              gene expression, providing insights into cell type-specific functions, gene regulatory networks, and the
              dynamic changes in chromatin states during development or disease progression.
            </p>
          </div>
          <div class="content-image">
            <img src="@/assets/dna.png" alt="DNA visualization" class="rounded-image" />
          </div>
        </div>
      </section>

      <!-- Integration Section -->
      <section class="content-section alt-bg">
        <div class="section-container">
          <div class="content-text full-width">
            <h2 class="section-title">Integrating scRNA-seq and scATAC-seq for Cell Type Annotation</h2>
            <p>
              By integrating data from scRNA-seq and scATAC-seq, researchers can achieve a more comprehensive view of
              cellular identity. scRNA-seq provides detailed insights into the transcriptional state of cells, while
              scATAC-seq sheds light on the regulatory elements that shape these transcriptional programs. Together,
              these technologies allow for more accurate annotation of cell types and states, understanding of cellular
              hierarchies, and identification of key regulatory mechanisms driving cell fate decisions.
            </p>
            <p>
              Single-cell type annotation, using both transcriptomic and epigenomic data, is crucial for
              advancing our understanding of biology, developing new therapeutic strategies, and personalizing medicine
              based on the cellular makeup of individual patients.
            </p>
            <p>
              Cell type annotation is paramount for subsequent biomedical research endeavors. Recently, supervised
              classification methods based on deep learning have demonstrated significant advancements in cell type
              annotation. However, challenges persist regarding how to efficiently leverage single-cell multi omics data
              for cell type annotation and interpretation and how to endow models with adaptive generalization
              capabilities for efficient identification of rare cell types.
            </p>
            <p>
              We introduce scMoAnno, a methodology for cell type annotation based on single-cell multi-omics data.
              Leveraging pre-trained cross-attention networks, scMoAnno facilitates efficient mutual learning and fusion
              of genetic and epigenetic distributions in single-cell multi-omics data, enabling precise cell type
              annotation. Predictions conducted by scMoAnno on single-cell RNA sequencing (scRNA-seq) and single-cell
              assay for transposase-accessible chromatin sequencing (scATAC-seq) data demonstrate enhanced
              generalization capacity for the recognition of rare cell types through pre-trained feature fusion
              extraction and training of classifiers based on fused data inputs.
            </p>
            <p>
              Rigorously conducted experiments on four meticulously curated benchmark datasets illustrate that scMoAnno
              surpasses nine other state-of-the-art baseline models in overall performance. Furthermore, the increase in
              clustering scores, fused with multi-omics data and extracted by scMoAnno, is elucidated from the
              perspective of promoting downstream analysis of single cells, explaining how our model's enhancement of
              cell type annotation performance yields positive effects.
            </p>
          </div>
        </div>
      </section>

      <!-- Results Section -->
      <section class="content-section">
        <div class="section-container">
          <div class="content-text">
            <h2 class="section-title">The workflow diagram of scMoAnno</h2>
            <p>
              The scMoAnno model undergoes two rounds of supervised learning. In the first round, a pre-trained fusion
              feature extractor is utilized to perform cross-attention feature extraction on scRNA-seq and scATAC-seq
              data, encoding the interaction features of the two modalities.
            </p>
            <p>
              In the second round, using the feature data generated by the pre-trained feature extractor, a
              Transformer-based fusion data cell type annotation module is introduced to achieve the precise assignment
              of cell types.
            </p>
            <h2 class="section-title mt-8">Comparative analysis results</h2>
            <p>
              In Table, the scMoAnno method outperformed the baseline comparison methods regarding accuracy
              metrics. Compared to the best-performing baseline method CIForm in terms of accuracy, the scMoAnno method
              achieved a 2% improvement in accuracy. In terms of balanced accuracy metrics, it reached a balanced
              accuracy of 90%, which was on par with the best-performing baseline method, scTransSort. Thus, this
              validates the feasibility and effectiveness of the proposed method in this study.
            </p>
          </div>
          <div class="content-image">
            <img src="@/assets/model_data.png" alt="Model data visualization" class="data-image" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import MainHeader from "../components/MainHeader.vue"

export default {
  name: 'HomeView',
  components: {
    MainHeader
  },
}
</script>

<style scoped>
.main-page {
  overflow-x: hidden;
  height: 100vh;
  scroll-behavior: smooth;
  font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* Hero section - unchanged as requested */
.fullscreen-mainpage-section {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #001429;
  position: relative;
  overflow: hidden;
}

.background-images {
  position: absolute;
  width: 100%;
  height: 100%;
}

.rotating-image {
  position: absolute;
  animation: rotate 25s linear infinite;
  opacity: 0.9;
}

.bg-img-1 {
  top: 30%;
  left: 80%;
  z-index: 5;
}

.bg-img-2 {
  top: 30%;
  left: 80%;
  z-index: 4;
}

.bg-img-3 {
  top: 80%;
  left: 30%;
  z-index: 1;
}

.bg-img-4 {
  top: 15%;
  left: 10%;
  z-index: 3;
}

.bg-img-5 {
  top: 15%;
  left: 10%;
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  width: 90%;
  max-width: 1200px;
  padding: 20px;
}

.logo-container {
  margin-bottom: 20px;
}

.logo {
  width: 120px;
  height: auto;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.1);
}

.hero-title {
  color: #ffffff;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 30px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.scroll-indicator {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 1.5rem;
  animation: bounce 2s infinite;
}

/* Improved Content sections */
.content-section {
  min-height: 100vh;
  padding: 80px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
}

.alt-bg {
  background-color: #f7f9fc;
  background-image: linear-gradient(120deg, #f7f9fc 0%, #edf3fa 100%);
}

.section-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  max-width: 1650px;
  width: 100%;
  margin: 0 auto;
  gap: 40px;
}

.content-text {
  flex: 1;
  min-width: 300px;
  padding: 20px;
  line-height: 1.8;
}

.full-width {
  flex-basis: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.section-title {
  font-size: 2rem;
  color: #003366;
  margin-bottom: 25px;
  position: relative;
  padding-bottom: 12px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.section-title:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #0066cc, #4da6ff);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.section-title:hover:after {
  width: 120px;
}

.content-text p {
  margin-bottom: 20px;
  line-height: 1.8;
  color: #2c3e50;
  font-size: 1.05rem;
  font-weight: 400;
  letter-spacing: 0.01em;
  max-width: 95%;
}

.content-image {
  flex: 1;
  min-width: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.rounded-image {
  max-width: 90%;
  height: auto;
  border-radius: 50%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  transform: rotate(30deg);
  transition: all 0.4s ease;
  border: 5px solid rgba(255, 255, 255, 0.8);
}

.rounded-image:hover {
  transform: rotate(40deg) scale(1.05);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.data-image {
  max-width: 95%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  transition: all 0.4s ease;
  border: 1px solid #eaeaea;
}

.data-image:hover {
  transform: scale(1.03);
  box-shadow: 0 12px 40px rgba(0, 102, 204, 0.2);
}

.mt-8 {
  margin-top: 2.5rem;
}

@keyframes rotate {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0) translateX(-50%);
  }
  40% {
    transform: translateY(-10px) translateX(-50%);
  }
  60% {
    transform: translateY(-5px) translateX(-50%);
  }
}

/* Improved Responsive Styles */
@media (max-width: 992px) {
  .section-container {
    flex-direction: column;
    gap: 20px;
  }
  
  .content-text, .content-image {
    width: 100%;
    padding: 15px 15px 15px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .content-text {
    text-align: center;
  }
  
  .content-text p {
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  
  .hero-title {
    font-size: 1.8rem;
    letter-spacing: 0;
  }
  
  .section-title {
    font-size: 1.6rem;
    text-align: center;
  }
  
  .section-title:after {
    left: 50%;
    transform: translateX(-50%);
  }
}

@media (max-width: 768px) {
  .content-section {
    padding: 60px 15px;
    min-height: auto;
  }
  
  .hero-title {
    font-size: 1.6rem;
    margin-bottom: 20px;
  }
  
  .section-title {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
  
  .logo {
    width: 100px;
  }
  
  .rounded-image, .data-image {
    max-width: 85%;
  }
  
  .content-text p {
    margin-bottom: 16px;
    font-size: 1rem;
    line-height: 1.7;
  }
  
  .section-container {
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .content-section {
    padding: 40px 12px;
  }
  
  .hero-title {
    font-size: 1.3rem;
  }
  
  .section-title {
    font-size: 1.3rem;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }
  
  .section-title:after {
    width: 60px;
    height: 3px;
  }
  
  .logo {
    width: 80px;
  }
  
  .scroll-indicator {
    font-size: 1.2rem;
  }
  
  .content-text p {
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 12px;
  }
  
  .content-text, .content-image {
    padding: 12px 12px 12px 0;
  }
  
  .rounded-image, .data-image {
    max-width: 90%;
  }
}

.dark-mode .alt-bg{
  background-image: linear-gradient(120deg, #1e1e1e 0%, #252525 100%);
}

.dark-mode .alt-bg p{
  color: #ffffff;
}

.dark-mode .content-text p{
  color: #ffffff;
}

.dark-mode .section-title {
  color: #ffffff;
}

.dark-mode .content-section{
  background-color: #2c2c2c;
}
</style>