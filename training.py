import numpy as np
import matplotlib.pyplot as pb
from mpl_toolkits.mplot3d import Axes3D
import GPy
# sort the training dataset from the txt.file
#@parameter: file_name @return: X:x,y cordinate Y:signal strength
def trainingData(file_name='localizationData.txt'):
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
def runTraining(file_name='localizationData.txt',plot=True):
    # main r
    X,Y = trainingData(file_name='localizationData.txt')
    kernel = GPy.kern.RBF(input_dim=Y.shape[1], variance=20., lengthscale=1000.)
    m = GPy.models.GPRegression(Y,X,kernel)
    m.optimize()
    # 1: Saving a model:
    np.save('model_save.npy', m.param_array)

runTraining();
