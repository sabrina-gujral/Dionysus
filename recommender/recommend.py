import pandas as pd
import sys
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

def movie_recommend(title):
    df = pd.read_csv('./data/movies_complete.csv')
    xdf = df[['title', 'genres', 'movie_url', 'poster' , 'director']]
    df = df[['title', 'genres', 'director']]
    df.dropna(inplace=True)
    df['bag'] = df['genres'] + '|' + df['director']

    tf = TfidfVectorizer(analyzer='word',
                         ngram_range=(1, 3),
                         min_df=0,
                         stop_words='english')
    matrix = tf.fit_transform(df['bag'])

    cosine_similarities = linear_kernel(matrix,matrix)
    movie_title = xdf
    indices = pd.Series(df.index, index=df['title'])

    idx = indices[title]
    sim_scores = list(enumerate(cosine_similarities[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:31]

    movie_indices = [i[0] for i in sim_scores]

    return movie_title.iloc[movie_indices].to_json()


def main():
    movie_recommend(sys.argv[1])

if __name__ == '__main__':
    main()

    