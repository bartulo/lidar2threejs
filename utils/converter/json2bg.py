import sys
import json

filename = sys.argv[1]

with open(filename, 'r') as f:
  obj = json.load(f)

metadata = obj[ 'metadata' ]
data = obj[ 'geometries' ][ 0 ][ 'data' ]
json_dict = { 'metadata' : metadata, 'data': data } 

print json_dict
with open( filename, 'w' ) as f:
  json.dump( json_dict, f )
