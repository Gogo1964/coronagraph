# -*- coding: utf-8 -*-
"""
Evaluation of Corona data from RKI
"""

import os
import pandas as pd
from sklearn.linear_model import LinearRegression

def convertFilename(fnameSource):
    sdot = [x.strip() for x in fnameSource.split('.')]
    day = int(sdot[0].split('_')[1])
    month = int(sdot[1])
    scomma = [x.strip() for x in sdot[2].split(',')]
    year = int(scomma[0])
    hour = scomma[1][0:2]
    minute = scomma[1][3:5]
    return str(year) + str(month).zfill(2) + str(day).zfill(2) + '_' + str(hour).zfill(2) + str(minute).zfill(2) + '.csv'

def convert(fnamesrc, fnamedest):
    colnames = ['Bundesland', 'Anzahl', 'Diff', 'AnzPer100K', 'Todesfälle']
    df = pd.read_csv(fnamesrc, sep=';',  header=0, names=colnames, thousands='.', decimal=',')
    df.to_csv(fnamedest, sep=';')
   
srcPath = '../csv'
destPath = '../ucsv'
    
if not os.path.exists(destPath):
    os.mkdir(destPath)    
    
for filename in os.listdir(srcPath):
    if filename.endswith('.csv'):
        convert(os.path.join(srcPath, filename), os.path.join(destPath, convertFilename(filename)))
        continue
    else:
        continue
    
   

"""    
model = LinearRegression()
model.fit([[10], [20], [30]], [-5, 10, 25])
print(model.coef_)
print(model.intercept_)
print(model.predict([[0]]))
"""