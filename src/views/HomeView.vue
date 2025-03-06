<template>
  <div class="main-page">
    <MainHeader></MainHeader>
    <div>
      <section class="fullscreen-mainpage-section" style="position: relative;">
        <div>
          <img src="@/assets/background/1.png" alt="mainpage" class="rotating-image"
            style="z-index: 5; top: 30%; left: 80%;" />
          <img src="@/assets/background/2.png" alt="mainpage" class="rotating-image"
            style="z-index: 4; top: 30%; left: 80%;" />
          <img src="@/assets/background/3.png" alt="mainpage" class="rotating-image"
            style="z-index: 1; top: 80%; left: 30%;" />
          <img src="@/assets/background/4.png" alt="mainpage" class="rotating-image"
            style="z-index: 3; top: 15%; left: 10%;" />
          <img src="@/assets/background/5.png" alt="mainpage" class="rotating-image"
            style="z-index: 2; top: 15%; left: 10%;" />
        </div>
        <div class="logo-container" style="z-index: 999;">
          <img src="@/assets/logo.png" alt="Logo" class="logo" />
        </div>
        <h1 style="margin-left: 20px; color: #ffffff; z-index: 999;">SCGADS: Smart Computing Genomic Analysis & Display System
          for Single-cell Data</h1>
        <div class="scroll-indicator" style="z-index: 999;">
        <el-icon>
          <ArrowDownBold />
        </el-icon>
        </div>
      </section>
      <section class="intro-section">
        <div class="intro-container">
          <div class="intro-text">
            <h1>Introduction to Single-Cell Type Annotation</h1>
            Single-cell type annotation is a process in bioinformatics used to classify and identify different cell
            types within a heterogeneous population at the single-cell level. This is crucial in understanding the
            complex cellular composition of tissues, organs, and entire organisms. With the advent of high-throughput
            single-cell sequencing technologies, researchers can now examine the transcriptomic and epigenomic
            profiles of thousands to millions of cells, gaining deeper insights into cellular diversity,
            differentiation pathways, and disease mechanisms.
            <br>
            <h1>What is scRNA-seq?</h1>
            Single-cell RNA sequencing (scRNA-seq) is a powerful technique used to measure the gene expression levels
            of individual cells. By capturing and sequencing the messenger RNA (mRNA) from single cells, scRNA-seq
            enables the construction of comprehensive cellular maps, revealing the identities and states of distinct
            cell types. This technology has revolutionized our understanding of cell differentiation, development, and
            the molecular basis of diseases. scRNA-seq helps in discovering new cell types, understanding cell-to-cell
            heterogeneity, and characterizing rare or transient cell populations that might be masked in bulk RNA
            sequencing approaches.
            <br>
            <h1>What is scATAC-seq?</h1>
            Single-cell Assay for Transposase-Accessible Chromatin using sequencing (scATAC-seq) is a technique used
            to analyze the epigenetic landscape of individual cells by mapping open chromatin regions. Unlike
            scRNA-seq, which focuses on gene expression, scATAC-seq provides information about the accessibility of
            DNA regions that are potentially regulatory, such as enhancers and promoters. By understanding which
            regions of the genome are accessible, scATAC-seq helps to elucidate the regulatory mechanisms that control
            gene expression, providing insights into cell type-specific functions, gene regulatory networks, and the
            dynamic changes in chromatin states during development or disease progression.
          </div>
          <div class="intro-image"
            style="height: 75%; border-radius: 1000px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <img src="@/assets/dna.png" alt="介绍图片" style="rotate: 30deg; height: 100%; border-radius: 1000px;" />
          </div>
        </div>
      </section>
      <section class="intro-section">
        <div class="intro-container">
          <div class="intro-text">
            <h1>Integrating scRNA-seq and scATAC-seq for Cell Type Annotation</h1>
            By integrating data from scRNA-seq and scATAC-seq, researchers can achieve a more comprehensive view of
            cellular identity. scRNA-seq provides detailed insights into the transcriptional state of cells, while
            scATAC-seq sheds light on the regulatory elements that shape these transcriptional programs. Together,
            these technologies allow for more accurate annotation of cell types and states, understanding of cellular
            hierarchies, and identification of key regulatory mechanisms driving cell fate decisions.
            <br><br>
            Single-cell type annotation, using both transcriptomic and epigenomic data, is crucial for
            advancing our understanding of biology, developing new therapeutic strategies, and personalizing medicine
            based on thecellular makeup of individual patients.
            <br><br>
            Cell type annotation is paramount for subsequent biomedical research endeavors. Recently, supervised
            classification methods based on deep learning have demonstrated significant advancements in cell type
            annotation. However, challenges persist regarding how to efficiently leverage single-cell multi omics data
            for cell type annotation and interpretation and how to endow models with adaptive generalization
            capabilities for efficient identification of rare cell types. We introduce scMoAnno, a methodology for
            cell type annotation based on single-cell multi-omics data. Leveraging pre trained cross-attention
            networks, scMoAnno facilitates efficient mutual learning and fusion of genetic and epigenetic
            distributions in single-cell multi-omics data, enabling precise cell type annotation. Predictions
            conducted by scMoAnno on single-cell RNA sequencing (scRNA-seq) and single-cell assay for
            transposase-accessible chromatin sequencing (scATAC-seq) data demonstrate enhanced generalization capacity
            for the recognition of rare cell types through pre-trained feature fusion extraction and training of
            classifiers based on fused data inputs. Rigorously conducted experiments on four meticulously curated
            benchmark datasets illustrate that scMoAnno surpasses nine other state-of the-art baseline models in
            overall performance. Furthermore, the increase in clustering scores, fused with multi-omics data and
            extracted by scMoAnno, is elucidated from the perspective of promoting downstream analysis of single
            cells, explaining how our model’s enhancement of cell type annotation performance yields positive effects.
          </div>
        </div>
      </section>
      <section class="intro-section">
        <div class="intro-container">
          <div class="intro-text">
            <h1>The workflow diagram of the single-cell multi-omics cell type annotation algorithm, scMoAnno</h1>
            The scMoAnno model undergoes two rounds of supervised learning. In the first round, a pre-trained fusion
            feature extractor is utilized to perform
            cross-attention feature extraction on scRNA-seq and scATAC-seq data, encoding the interaction features of
            the two modalities.
            In the second round, using the feature data generated by the pre-trained feature extractor, a
            Transformer-based fusion data cell
            type annotation module is introduced to achieve the precise assignment of cell types.
            <br><br><br><br><br><br>
            <h1> Comparative analysis results of the proposed model against base lines on datasets from 10X-Multiome,
              ISSAAC-seq, and SHARE-seq</h1>
            In Table, the scMoAnno method outperformed the baseline comparison methods regarding accuracy
            metrics. Compared to the best-performing base line method CIForm in terms of accuracy, the scMoAnno method
            achieved a 2% improvement in accuracy. In terms of balanced accuracy
            metrics, it reached a balanced accuracy of 90%, which was on par with the best-performing base line
            method, scTransSort. Thus, this validates the feasibility and effectiveness of the proposed
            methodinthisstudy.
          </div>
          <div class="intro-image">
            <img src="@/assets/model_data.png" alt="介绍图片" />
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