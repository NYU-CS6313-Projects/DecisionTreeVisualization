def binary(node):
    node['left'] = node
    node['right'] = node['left']
    print node
    return node

dct ={}
n = 3
for i in range(n):
    dct['left'] = binary(dct)
    print dct
    dct['right'] = dct['left']
print dct
print type(dct['left']['left']['left']['left']['left'])






# c = 0 
# for i in range(1000):
#     if i == 0:
#         data = dct['right']
#     else:
#         data = data['right']
#         c += 1
#         # print c
















dct = {}
dct['left'] = dct
print type(dct['left']['left']['left']['left']['left'])

















