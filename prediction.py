import numpy as np
import matplotlib.pyplot as pb
from mpl_toolkits.mplot3d import Axes3D
import GPy
import training
# sort the training dataset from the txt.file
#@parameter: file_name @return: X:x,y cordinate Y:signal strength
def readData(file_name='predictionData1.txt'):
    # WiFi access point strengths on a tour around UW Paul Allen building.
    all_time = np.genfromtxt(file_name, usecols=(0))
    macaddress = np.genfromtxt(file_name, usecols=(1), dtype='string')
    x = np.genfromtxt(file_name, usecols=(2))
    y = np.genfromtxt(file_name, usecols=(3))
    strength = np.genfromtxt(file_name, usecols=(4))
    addresses = np.unique(macaddress)
    times = np.unique(all_time)
    addresses.sort()
    times.sort()
    allY = np.zeros((len(times), len(addresses)))
    allX = np.zeros((len(times), 2))
    strengths={}
    for address, j in zip(addresses, list(range(len(addresses)))):
        ind = np.nonzero(address==macaddress)
        temp_strengths=strength[ind]
        temp_x=x[ind]
        temp_y=y[ind]
        temp_times = all_time[ind]
        for time in temp_times:
            vals = time==temp_times
            if any(vals):
                ind2 = np.nonzero(vals)
                i = np.nonzero(time==times)
                allY[i, j] = temp_strengths[ind2]
                allX[i, 0] = temp_x[ind2]
                allX[i, 1] = temp_y[ind2]
    X = allX[:, :]
    Y = allY[:, :]
    return X,Y
# GP regression using the trainingdata set
#@parameter: file_name, plot_enable
#@return: predicted position
def runRegression(file_name='predictionData1.txt',plot=True):
    # main r
    X,Y=training.trainingData()
    Xoriginal,Ypredict=readData(file_name='predictionData1.txt')
    # 2: loading a model
    # Model creation, without initialization:
    m_load = GPy.models.GPRegression(Y, X, initialize=False)
    m_load.update_model(False) # do not call the underlying expensive algebra on load
    m_load.initialize_parameter() # Initialize the parameters (connect the parameters up)
    m_load[:] = np.load('model_save.npy') # Load the parameters
    m_load.update_model(True) # Call the algebra only once
    Xpredict = m_load.predict(Y[:])[0]
    print ('Predicted Position')
    print Xpredict[:]
    if plot:
        pb.plot(X[:, 0], X[:, 1], 'r-')
        pb.plot(Xpredict[:, 0], Xpredict[:, 1], 'b-')
        pb.axis('equal')
        pb.title('WiFi Localization with Gaussian Processes')
        pb.legend(('True Location', 'Predicted Location'))
        fig = pb.figure()
        ax = fig.add_subplot(111, projection='3d')
        ax.scatter(X[:,0], X[:,1], c='r', marker='o')
        ax.scatter(Xpredict[:,0], Xpredict[:,1], c='b', marker='^')
        pb.show()
    return Xpredict
runRegression();
