# What 1.2 Million Parliamentary Speeches Can Teach Us About Gender Representation

Read the full article on [The Pudding](https://pudding.cool/2018/07/women-in-parliament)

![image](https://github.com/user-attachments/assets/e121cda7-d37e-4049-9e43-52f9faa8e35e)

This interactive visualization explores the last 100 years of women in parliament through data and identifies their contributions with the help of machine learning. 

**This project was made possible by:**

* The House of Commons Library
* MySociety
* TheyWorkForYou
* Inter-Parliamentary Union

**Technology used:**

* **D3.js** and **scrollama** were used to create the scrolling, interactive experience.
* **Python**, **pandas**, **gensim**, and **spaCy** were used to collect, clean, and analyze the data.

**Explore the visualization:**

* Click the **'Read the US Congress Version'** link at the top of the page to explore a similar visualization of the United States Congress.
* Scroll down to explore the visualization, which covers the following topics:
    * The History of Women in Parliament
    * Gender Parity in Parliament
    * Topics Discussed by Men and Women
    * Women Parliamentary Candidates
* **Explore the data** by hovering over the interactive elements of the visualization.
* **Click** on the interactive elements to learn more about specific MPs.

---

## About the Data

This visualization uses a combination of datasets to illustrate the representation of women in the UK House of Commons. 

* **Women MPs:** Chronological data of women MPs from the House of Commons Library ([http://researchbriefings.parliament.uk/ResearchBriefing/Summary/SN06652](http://researchbriefings.parliament.uk/ResearchBriefing/Summary/SN06652))
* **MPs over time:** All speech and MP data from TheyWorkForYou.com ([https://www.theyworkforyou.com/](https://www.theyworkforyou.com/)).
* **Parliaments in the OECD:** Data on parliaments in the OECD from the Inter-Parliamentary Union ([http://archive.ipu.org/wmn-e/classif.htm](http://archive.ipu.org/wmn-e/classif.htm))
* **Parliamentary Candidates:** Data on parliamentary candidates over time from the House of Commons Library upon request.
* **MP photos:** Photos of MPs sourced from Wikipedia and the UK Parliament website, which are licensed under a Creative Commons International 4.0 license.

## Methodology

1. **Data Collection:** The data for this visualization was collected using a combination of scraping and API calls.
2. **Data Cleaning and Preprocessing:** The data was then cleaned and preprocessed to remove any errors or inconsistencies. This included removing duplicate entries, converting dates to a standardized format, and creating new fields for analysis.
3. **Topic Modeling:** Latent Dirichlet Allocation (LDA) was used to identify the major topics discussed in parliamentary speeches. This was done by analyzing the words that frequently appear together in speeches and grouping them into different topics.
4. **Visualization:** The data was then visualized using a combination of D3.js and Canvas. The visualization was designed to be interactive and informative, allowing users to explore the data in a variety of ways.

## Key Findings

This visualization reveals several key findings about the representation of women in the UK House of Commons:

* **Progress Towards Gender Parity:** While the number of women MPs has increased significantly over the past century, the House of Commons is still far from achieving gender parity.
* **Party Differences:** The representation of women varies significantly across different political parties, with Labour having the highest percentage of women MPs.
* **Topic Focus:** Men and women MPs tend to discuss different topics in their speeches. Women MPs are more likely to focus on topics related to crime, social welfare and care, while men MPs are more likely to focus on topics related to economics, security, and defense.
* **Candidate Selection:** The lack of gender equality in parliament is a demand-side problem. Parties are not selecting enough women as candidates, especially in marginal constituencies, which are more likely to elect new MPs.
