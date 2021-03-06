install.packages('tidyr')
install.packages('magrittr')
install.packages('stringr')
install.packages('plyr')
install.packages('dplyr')
install.packages('networkD3')
install.packages('reshape2')

setwd("/Users/astephan/Desktop/d3js/Reseau/whatsapp")
library(tidyr)
library(magrittr)
library(stringr)
library(plyr)
library(dplyr)
library(networkD3)
library(reshape2)
options(digits=4)



e <- read.csv('whatsapp.csv', header = TRUE, sep = ",")$keywords %>%
  str_split(";") %>%
  lapply(function(x) {
    expand.grid(x, x, w = 1 / length(x), stringsAsFactors = FALSE)
  }) %>%
  bind_rows

e <- apply(e[, -3], 1, str_sort) %>%
  t %>%
  data.frame(stringsAsFactors = FALSE) %>%
  mutate(w = e$w)

e <- group_by(e, X1, X2) %>%
  summarise(w = sum(w)) %>%
  filter(X1 != X2)

names(e) <- c("Mot1","Mot2","Poids")

#Poids relatifs
e$Poids <- e$Poids/max(e$Poids)

write.table(e, file='liens_whatsapp.csv', quote = FALSE, sep=',', col.names = TRUE,
            row.names = FALSE)
