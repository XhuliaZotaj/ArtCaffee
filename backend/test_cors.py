import requests

print('Testing CORS headers on loyalty endpoints...')
try:
    response = requests.options('http://localhost:5000/api/loyalty/points', 
                            headers={
                                'Origin': 'http://localhost:3000',
                                'Access-Control-Request-Method': 'GET',
                                'Access-Control-Request-Headers': 'Authorization,Content-Type'
                            })
    print('OPTIONS response headers:')
    for header, value in response.headers.items():
        print(f"  {header}: {value}")
    
    if 'Access-Control-Allow-Origin' in response.headers:
        print('\nAccess-Control-Allow-Origin header found:', response.headers['Access-Control-Allow-Origin'])
        print('Test passed!')
    else:
        print('\nAccess-Control-Allow-Origin header missing!')
except Exception as e:
    print('Error testing CORS:', e) 